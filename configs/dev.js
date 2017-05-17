/*!
 * authorization.io development configuration.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
var config = require('bedrock').config;
var os = require('os');
var path = require('path');

// common paths
config.paths.cache = path.join(__dirname, '..', '.cache');
config.paths.log = path.join(os.tmpdir(), 'authorization.dev');

// load the demo extensions to the site
require('../demo/lib/idp');
require('../demo/lib/issuer');

// pseudo bower package for demo idp, issuer, and consumer
config.requirejs.bower.packages.push({
  path: path.join(__dirname, '..', 'demo', 'components'),
  manifest: {
    name: 'authio-demo',
    moduleType: 'amd',
    main: './main.js',
    dependencies: {
      angular: '~1.5.0'
    }
  }
});

// serve demo contexts and vocabs
config.express.static.push(path.join(__dirname, '..', 'static'));

// setup to load contexts locally
config.views.vars.contextMap[config.constants.SECURITY_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/security-v1.jsonld';
config.views.vars.contextMap[config.constants.IDENTITY_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/identity-v1.jsonld';
config.views.vars.contextMap[config.constants.CREDENTIALS_CONTEXT_V1_URL] =
  config.server.baseUri + '/contexts/credentials-v1.jsonld';

// setup to load demo vocabs
config.views.vars['bedrock-angular-credential'] =
  config.views.vars['bedrock-angular-credential'] || {};
config.views.vars['bedrock-angular-credential'].libraries =
  config.views.vars['bedrock-angular-credential'].libraries || {};
config.views.vars['bedrock-angular-credential'].libraries.default = {
  vocabs: [
    config.server.baseUri + '/vocabs/test-v1.jsonld'
  ]
};

// lower minimum wait time for proofs
config.authio.proofs.proofOfPatience.minWaitTimeInSecs = 2;
config.authio.proofs.proofOfPatience.maxWaitTimeInSecs = 3;

const ignorePackages = [
  "angular-animate",
  "angular-bootstrap",
  "angular-cookie",
//  "angular-route",
//  "angular-sanitize",
//  "angular-stackables",
  "ui-select",
  "async",
//  "bedrock-angular-alert",
  "bedrock-angular-card-displayer",
  "bedrock-angular-credential",
//  "bedrock-angular-filters",
//  "bedrock-angular-footer",
//  "bedrock-angular-form",
  "bedrock-angular-identity-composer",
//  "bedrock-angular-lazy-compile",
  "bedrock-angular-media-query",
//  "bedrock-angular-modal",
//  "bedrock-angular-model",
  "bedrock-angular-navbar",
  "bedrock-angular-resolver",
  "bedrock-angular-resource",
  "bedrock-angular-selector",
  "bedrock-angular-session",
  "bedrock-angular-ui",
  "bootstrap",
//  "credentials-polyfill",
//  "dialog-polyfill",
//  "did-io",
//  "es6-promise",
//  "forge",
  "jquery",
//  "jsonld",
//  "jsonld-signatures",

  "lodash",
  "ng-error",
  "ng-multi-transclude",
//  "node-uuid",
//  "authio",
  "authio-demo"
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
