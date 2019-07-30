const apicache = require('apicache');
const cacheSuccess = (req, res) => res.status === 200;
module.exports = {
    cache: apicache.middleware,
    cacheSuccess
};
