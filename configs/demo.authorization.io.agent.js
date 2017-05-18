/*!
 * authorization.io agent demo configuration.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
const bedrock = require('bedrock');
const config = bedrock.config;

require('./demo.authorization.io');
require('./agent');

// common paths
config.paths.cache = '/var/cache/authorization.io/agent';
config.paths.log = '/var/log/authorization.io/agent';
