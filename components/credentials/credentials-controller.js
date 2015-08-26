define([
  'underscore',
  'async',
  'forge/js/forge',
  'jsonld',
  'jsonld-signatures'
], function(_, async, forge, jsonld, jsigjs) {

'use strict';

/* @ngInject */
function factory($scope, config, $location, ipCookie, localStorageService) {

  var self = this;
  self.callback = sessionStorage.getItem($location.search().id);
  self.callbackHostName = new URL(self.callback).hostname;
  self.identity = config.data.authio.identity;
  self.transmitDisabled = true;
  self.confirmTransmission = true;
  var trustedDomainPrefix = 'settings.trustedDomains.';
  var trustedDomainKey = trustedDomainPrefix + self.callbackHostName;

  if(localStorageService.get(trustedDomainKey) === 'bypass') {
    self.confirmTransmission = false;
  }

  // setup custom document loader for identity JSON-LD context
  jsonld = jsonld();
  var _oldLoader = jsonld.documentLoader;
  jsonld.documentLoader = function(url) {
    if(url in config.data.CONTEXTS) {
      return Promise.resolve({
        contextUrl: null,
        document: config.data.CONTEXTS[url],
        documentUrl: url
      });
    }
    return _oldLoader(url);
  };

  // initialize jsig using the AMD-loaded helper libraries
  var jsig = jsigjs({inject: {
    async: async,
    forge: forge,
    jsonld: jsonld,
    _: _
  }});

  // refresh the session cookie
  var session = ipCookie('session');
  // refresh session
  ipCookie('session', session, {
    expires: 120,
    expirationUnit: 'minutes'
  });

  // extract the keyInfo if it exists in the session
  self.keyInfo = session.publicKey;

  // sign the identity
  var signer = {
    privateKeyPem: self.keyInfo.privateKeyPem
  };
  if(self.keyInfo.id) {
    signer.creator = self.keyInfo.id;
  }
  jsig.sign(self.identity, signer, function(err, signedIdentity) {
    if(err) {
      console.log('Error: Signature on identity failed:', err);
    }
    self.identity.signature = signedIdentity.signature;
    if(!self.confirmTransmission) {
      return self.transmitCredentials();
    }
    self.transmitDisabled = false;
    $scope.$apply();
  });

  self.transmitCredentials = function() {
    navigator.credentials.transmit(self.identity, {
      responseUrl: self.callback
    });
  };

  self.setBypass = function() {
    if(self.bypassConfirmation) {
      // bypass option is checked
      localStorageService.set(trustedDomainKey, 'bypass');
    } else {
      // bypass option is not checked
      localStorageService.remove(trustedDomainKey);
    }
  };
};

return {CredentialsController: factory};

});
