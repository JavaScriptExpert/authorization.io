/*!
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
var bedrock = GLOBAL.bedrock;
var describe = GLOBAL.describe;
var it = GLOBAL.it;

// variables used throughout the tests
var baseId = bedrock.randomString().toLowerCase();
var identity = {};
identity.email = baseId + '@example.com';
identity.passphrase = 'ThisIsALongPassphrase23';

describe('registration', function() {
  var threeCharacters = 'abc';
  var oneHundredSixtyCharacters =
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM' +
    'P45C2nfqXTN17c1QubT0szamTrfACOBOvNs5m67' +
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM' +
    'P45C2nfqXTN17c1QubT0szamTrfACOBOvNs5m67';

  describe('decentralized identifier creation form', function() {

    beforeEach(function() {
      bedrock.pages.idp.navigateToRegistrationForm();
    });

    it('should contain the proper form elements', function() {
      bedrock.pages.idp.checkFields();
    });

    it('should warn on empty email', function() {
      bedrock.pages.idp.testField('model.username', '', 'required');
    });

    it('should warn on short email', function() {
      bedrock.pages.idp.testField(
        'model.username', threeCharacters, 'minlength');
    });

    it('should warn on long email', function() {
      bedrock.pages.idp.testField(
        'model.username', oneHundredSixtyCharacters, 'maxlength');
    });

    it('should warn on empty passphrase', function() {
      bedrock.pages.idp.testField('model.passphrase', '', 'required');
    });

    it('should warn on short passphrase', function() {
      bedrock.pages.idp.testField(
        'model.passphrase', threeCharacters, 'minlength');
    });

    it('should warn on long passphrase', function() {
      bedrock.pages.idp.testField(
        'model.passphrase', oneHundredSixtyCharacters, 'maxlength');
    });

    it('should warn if passphrase and confirmation do not match', function() {
      bedrock.pages.idp.testFieldsMatch(
        'model.passphrase', 'model.passphraseConfirmation', 'goodPhraseA',
        'nonMatchingPhraseB', 'inputMatch');
    });
  });

  describe('properly completed registration form', function() {

    beforeEach(function() {
      bedrock.pages.idp.navigateToRegistrationForm();
    });

    it('should create a mapping and DID document', function() {
      // Override default timeout, RSA key generation is slow on older CPUs.
      this.timeout(180000);
      bedrock.pages.idp.registerDid(identity);
    });
  });
});

describe('session management', function() {

  it('should reject an unknown email for login', function() {
    bedrock.pages.authio.navigateToLoginForm();
    bedrock.pages.authio.login({
      email: 'invalid-email@example.com',
      passphrase: identity.passphrase,
      expectFailure: true
    });
  });

  it('should reject an incorrect password for login', function() {
    bedrock.pages.authio.navigateToLoginForm();
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: 'invalid-passphrase',
      expectFailure: true
    });
  });

  // FIXME: This test may no longer be relevant
  it.skip('should allow a valid login from a public computer', function() {
    bedrock.pages.authio.navigateToLoginForm();
    this.timeout(180000);
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: identity.passphrase,
      publicComputer: true
    });
    bedrock.pages.authio.logout();
  });

  it('should allow a valid login', function() {
    bedrock.pages.authio.navigateToLoginForm();
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.authio.logout();
  });
});

describe('issuing', function() {
  it('should issue and store a credential', function() {
    bedrock.pages.authio.navigateToLoginForm().login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.issuer.issueAndStoreCredential();
  });
});

describe('consuming', function() {
  it('should compose, transmit, and consume a credential', function() {
    bedrock.pages.consumer.navigateToConsumer().getCredential();
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.consumer.retrieveCredential();
    bedrock.pages.authio.logout();
  });
});
