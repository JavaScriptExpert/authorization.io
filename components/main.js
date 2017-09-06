/*!
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
define([
  'angular',
  './register-did/register-did-component',
  './splash-component',
  './agent/agent',
  './identity/identity',
  './identity-chooser/identity-chooser',
  './idp-test/idp-test'
], function(angular, registerDidComponent, splashComponent) {

'use strict';

var module = angular.module('authio', [
  'authio.agent', 'authio.identity', 'authio.identityChooser',
  'authio.idp-test']);

registerDidComponent(module);
splashComponent(module);

/* @ngInject */
module.config(function($routeProvider) {
  $routeProvider
    .when('/splash', {
      title: 'Splash',
      template: '<aio-splash></aio-splash>'
    })
    .when('/register', {
      title: 'Register',
      template: '<aio-register-did></aio-register-did>'
    })
    .when('/test/credentials/idpquery', {
      title: 'Mock Credential Consumer Query',
      templateUrl: requirejs.toUrl('components/idp-test/idp-test.html')
    })
    .when('/test/credentials/composed-identity', {
      title: 'Mock Credential Consumer Query Results',
      templateUrl: requirejs.toUrl('components/idp-test/idp-test.html')
    })
    .when('/test/credentials/stored-credential', {
      title: 'Mock Credential Storage Results',
      templateUrl: requirejs.toUrl('components/idp-test/idp-test.html')
    });
});

});
