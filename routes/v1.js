const express = require('express');
const router = express.Router();
const path = require('path');

// Register routes
require('./locations')(router);
require('./bulidings')(router);
require('./users')(router);
require('./places')(router);

/* GET home page. */
router.get('/', function (req, res) {
    res.json({success: true, message: "Bookmarks API", data: {"version_number": "v1.0.0"}})
});

//********* API DOCUMENTATION **********
router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
