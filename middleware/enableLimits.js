/**
 * Enabled limiting. `req.queryConfig` should be defined.
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function enableLimits(req, res, next) {

    let limit = 20;
    if (req.query.limit) {
        limit = Math.min(+req.query.limit, 100);
    }
    const offset = req.query.offset ? +req.query.offset : 0;
    req.queryConfig.limit = limit;
    req.queryConfig.offset = offset;
    next();
}
module.exports = enableLimits;
