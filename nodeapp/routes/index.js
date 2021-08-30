const express = require('express');
const db = require("../db/db");
const router = express.Router();
const util = require('../utils/utils.js');

// Files containing response functions for each route, separation by category
require('./routes_hub')(router);
require('./routes_organizations')(router);

module.exports = router;
