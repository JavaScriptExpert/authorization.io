/*!
 * authorization.io production server.
 *
 * New BSD License (3-clause)
 * Copyright (c) 2015-2016, Digital Bazaar, Inc.
 * Copyright (c) 2015-2016, Accreditrust Technologies, LLC
 * All rights reserved.
 */
const bedrock = require('bedrock');
const config = bedrock.config;
const path = require('path');

require('./lib/index');
require('./configs/demo.authorization.io.agent');

bedrock.start();
