/*!
 * New BSD License (3-clause)
 * Copyright (c) 2015-2017, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
import angular from 'angular';
import uuid from 'uuid/v4';

export default {
  controller: Ctrl,
  templateUrl: 'authio/legacy/agent-component.html'
};

/* @ngInject */
function Ctrl(
  $document, $location, $sce, $rootScope, $scope, $window,
  aioIdentityService, aioOperationService, aioPermissionService,
  aioUtilService, config) {
  var self = this;
  self.autoIdSelect = false;
  self.route = $rootScope.route;
  self.isCryptoKeyRequest = false;
  self.did = null;
  self.display = {};
  self.identity = {
    label: null
  };
  self.modalContentClass = {};
  var query = $location.search();
  self.op = query.op;
  self.loading = false;

  // TODO: potentially change this to avoid using any URL param at all and
  // just use whatever comes through from `postMessage`; I believe we're
  // already checking to make sure what comes through in `postMessage` is
  // the same as this value as what `postMessage` reports is what we need
  // to trust, but given that, it seems we could eliminate this extra data?
  var relyingParty = query.origin;
  self.relyingParty = aioUtilService.parseDomain(relyingParty);

  var resultSent = false;

  // TODO: handle invalid query

  var CRYPTO_KEY_REQUEST = {
    '@context': 'https://w3id.org/identity/v1',
    id: '',
    publicKey: ''
  };

  /**
   * Called when an identity is selected in the identity chooser.
   *
   * @param id the ID of the identity that was selected.
   */
  self.identitySelected = function(id) {
    if(id === null) {
      // no ID was selected (can only happen when `enableRegistration=true`)
      return _sendError('NotRegisteredError');
    }
    // create a session based on the selected identity
    return aioIdentityService.createSession(id).then(
      self.complete.bind(self, null),
      self.complete.bind(self));
  };

  /**
   * Resumes the flow by proxying a message. This function is called after an
   * identity has been chosen.
   *
   * @param err an error if one occurred.
   * @param session the session associated with the selected identity.
   */
  self.complete = function(err, session) {
    if(err) {
      // FIXME: needs better error handling
      console.error(err);
      $scope.$apply();
      return;
    }

    self.identity.label = session.label;

    // get result (from either Repo or ourselves)
    var getResult;
    if(!(self.isCryptoKeyRequest && _isKeyDidBased(session))) {
      // need Repo to fulfill the request...

      // display Repo in iframe to handle request
      self.repoUrl = $sce.trustAsResourceUrl(
        session.idpConfig.credentialManagementUrl);
      self.repoOrigin = aioUtilService.parseOrigin(self.repoUrl);
      self.repoOriginImgError = false;
      self.repoDomain = aioUtilService.parseDomain(self.repoUrl);
      self.display.identityChooser = false;
      self.display.repo = true;
      self.display.repoLoading = true;
      self.modalContentClass = {
        'aio-native-modal-content-with-repo': true
      };
      $scope.$apply();

      // get iframe handle
      var iframe =
        angular.element($document[0].querySelector('iframe[name="repo"]'));
      var repoHandle = iframe[0].contentWindow;

      // delegate to Repo
      getResult = aioOperationService.delegateToRepo({
        op: query.op,
        params: self.params,
        repoUrl: session.idpConfig.credentialManagementUrl,
        repoHandle: repoHandle,
        onload: function() {
          self.display.repoLoading = false;
          $scope.$apply();
        }
      });
    } else {
      // can special handle request for permanent public key credential
      // on our own (no Repo required)...
      self.display.identityChooser = false;
      self.display.authenticating = true;
      $scope.$apply();

      // clone identity template
      var identity = JSON.parse(JSON.stringify(
        config.data.identityWithCryptographicKeyCredentialTemplate));
      identity.id = session.id;
      var credential = identity.credential[0]['@graph'];
      credential.id = 'urn:ephemeral:' + uuid();
      credential.claim = {
        id: session.id,
        publicKey: {
          id: session.publicKey.id,
          owner: session.publicKey.owner,
          publicKeyPem: session.publicKey.publicKeyPem
        }
      };
      getResult = aioIdentityService.sign({
        document: credential,
        publicKeyId: session.publicKey.id,
        privateKeyPem: session.privateKeyPem
      }).then(function(signed) {
        identity.credential[0]['@graph'] = signed;
        return identity;
      });
    }

    // send result to RP
    getResult.then(function(result) {
      return _sendSignedIdentity(result);
    }).catch(function(err) {
      // TODO: need better error handling -- we need to send an error back
      // to the relying party after displaying the problem on auth.io
      console.error(err);
    }).then(function() {
      self.display.authenticating = false;
      $scope.$apply();
    });
  };

  /**
   * Cancels sending any information to the relying party.
   */
  self.cancel = function() {
    if(query.op === 'requestPermission') {
      _sendResult('default');
    } else {
      _sendResult(null);
    }
  };

  self.showChooser = function() {
    aioIdentityService.clearSession();
    self.autoIdSelect = false;
    self.display.repo = false;
    self.display.identityChooser = true;
  };

  self.onAllow = function() {
    // set permission allowed
    aioPermissionService.allow(relyingParty, self.params);
    return _sendResult('granted');
  };

  self.onDeny = function() {
    // set permission blocked
    aioPermissionService.block(relyingParty, self.params);
    return _sendResult('denied');
  };

  $window.addEventListener('beforeunload', function() {
    _sendResult(null);
  });

  $window.document.addEventListener('keydown', function(e) {
    if(e.key === 'Escape' && e.target === $window.document.body) {
      self.cancel();
    }
  });

  // flow is just starting, clear old session
  aioIdentityService.clearSession();

  // request parameters from RP
  self.loading = true;
  aioOperationService.getParameters({
    op: self.op,
    origin: relyingParty
  }).then(function(params) {
    self.params = params;

    if(query.op === 'get') {
      var options = params.options;
      // special handle request for public key credential
      self.isCryptoKeyRequest = _isCryptoKeyRequest(options.query);
      // always show identity chooser for `get` requests even if a
      // specific DID was requested
      if('id' in options.query && options.query.id) {
        self.did = options.query.id;
      }
      self.enableRegistration = options.enableRegistration;
      self.display.identityChooser = true;
      if(!self.isCryptoKeyRequest) {
        self.autoIdSelect = true;
      }
      return;
    }

    if(query.op === 'store') {
      var options = params.options;
      // only show identity chooser if can't auto-authenticate as owner
      var owner = _getOwnerId(options.store);
      return aioIdentityService.createSession(owner)
        .catch(function(err) {
          // should not auto-authenticate, show identity chooser
          self.did = owner;
          self.display.identityChooser = true;
        }).then(function(session) {
          if(session) {
            // auto-authenticate worked, complete flow
            self.complete(null, session);
          }
        });
    }

    if(query.op === 'requestPermission') {
      if(aioPermissionService.isAuthorized(relyingParty, self.params)) {
        // all permissions already granted; send result
        return _sendResult('granted');
      }
      // TODO: if permissions `blocked` send 'denied' immediately?

      // get permission meta data for display
      try {
        self.permissions = aioPermissionService.getMeta(self.params);
      } catch(err) {
        return _sendError('NotSupportedError');
      }
      // return to show UI to ask for permission
      self.loading = false;
      return;
    }

    // TODO: handle invalid op better, provide more guidance to user and
    // send error back to relying party
    throw new Error(
      'The website you visited made an unsupported credential request. ' +
      'Please contact their technical support team for assistance.');
  }).catch(function(err) {
    if(query.op !== 'requestPermission') {
      // FIXME: better error handling
      console.error(err);
    }
  }).then(function() {
    if(query.op !== 'requestPermission') {
      self.loading = false;
    }
    $scope.$apply();
  });

  function _getOwnerId(identity) {
    return identity.credential[0]['@graph'].claim.id;
  }

  function _isKeyDidBased(identity) {
    return (identity.publicKey.id.indexOf('did') === 0);
  }

  function _isCryptoKeyRequest(query) {
    // query may have `id` set -- this doesn't affect whether or not it is
    // a crypto key request
    query = angular.extend({}, query);
    if('id' in query) {
      query.id = '';
    }
    return (query.id === '' &&
      query['@context'] === 'https://w3id.org/identity/v1' &&
      query.publicKey === '' && Object.keys(query).length === 3
    );
  }

  function _sendSignedIdentity(identity) {
    if(resultSent) {
      return;
    }
    resultSent = true;
    return aioOperationService.sendSignedIdentity(
      self.op, identity, relyingParty);
  }

  function _sendResult(result) {
    if(resultSent) {
      return;
    }
    resultSent = true;
    return aioOperationService.sendResult(self.op, result, relyingParty);
  }

  function _sendError(error) {
    if(resultSent) {
      return;
    }
    resultSent = true;
    return aioOperationService.sendError(self.op, error, relyingParty);
  }
}
