/*!
 * authorization.io agent development configuration.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
const bedrock = require('bedrock');
const config = bedrock.config;
const os = require('os');
const path = require('path');

require('./dev');
require('./agent');

// common paths
config.paths.cache = path.join(__dirname, '..', '.cache', 'agent');
config.paths.log = path.join(os.tmpdir(), 'authorization.dev.agent');
