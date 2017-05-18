/*!
 * authorization.io agent partial configuration.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2017, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
const bedrock = require('bedrock');
const config = bedrock.config;

const ignorePackages = [
  'angular-animate',
  'angular-bootstrap',
  'angular-cookie',
//  'angular-route',
//  'angular-sanitize',
//  'angular-stackables',
  'ui-select',
  'async',
//  'bedrock-angular',
//  'bedrock-angular-alert',
  'bedrock-angular-card-displayer',
  'bedrock-angular-credential',
//  'bedrock-angular-filters',
//  'bedrock-angular-footer',
//  'bedrock-angular-form',
  'bedrock-angular-identity-composer',
//  'bedrock-angular-lazy-compile',
  'bedrock-angular-media-query',
//  'bedrock-angular-modal',
//  'bedrock-angular-model',
  'bedrock-angular-navbar',
  'bedrock-angular-resolver',
  'bedrock-angular-resource',
  'bedrock-angular-selector',
  'bedrock-angular-session',
  'bedrock-angular-ui',
  'bootstrap',
//  'credentials-polyfill',
//  'dialog-polyfill',
//  'did-io',
//  'es6-promise',
//  'forge',
  'jquery',
//  'jsonld',
//  'jsonld-signatures',
  'lodash',
  'ng-error',
  'ng-multi-transclude',
//  'node-uuid',
//  'authio',
  'authio-demo'
];

config.requirejs.bower.ignore =
  config.requirejs.bower.ignore.concat(ignorePackages);
config.views.angular.optimize.templates.ignore.packages =
  config.views.angular.optimize.templates.ignore.packages.concat(
    ignorePackages);
config.requirejs.config.shim.angular = {exports: 'angular', deps: []};

config.requirejs.optimize.config.uglify2.mangle = true;
config.requirejs.optimize.config.uglify2.compress = {
  sequences: true,
  dead_code: true,
  conditionals: true,
  booleans: true,
  unused: true,
  if_return: true,
  join_vars: true,
  drop_console: true
};
