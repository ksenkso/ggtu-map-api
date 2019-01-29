const debug = require('debug')('App:Mid:Where');
async function enableWhere(req, res, next) {
    if (req.query.where) {
        debug(req.query.where);
        for (let prop in req.query.where) {
            if (req.query.where.hasOwnProperty(prop)) {
                if (!req.query.where[prop]) {
                    req.query.where[prop] = null;
                }
            }
        }
        req.queryConfig = req.queryConfig ? Object.assign(req.queryConfig, {where: req.query.where}) : {where: req.query.where};
        debug(req.queryConfig);
    }
    next();
}


module.exports = enableWhere;
