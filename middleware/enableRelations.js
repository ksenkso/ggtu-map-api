const debug = require('debug')('App:Mid:Rel');
const models = require('../models');
async function enableRelations(req, res, next) {
    if (req.query.with) {
        const relations = req.query.with.split(',');
        debug(relations);
        const include = [];
        relations.forEach((relName, index) => {
            if (models[relName]) {
                let attributes;
                if (req.query.attributes && req.query.attributes[index]) {
                    attributes = req.query.attributes[index].split(',').map(a => a.trim());
                    debug('Attributes found');
                } else {
                    attributes = Object.keys(models[relName].rawAttributes);
                    debug('Attributes not found');
                }
                debug(attributes);
                include.push({
                    model: models[relName],
                    attributes
                });
            }
            debug(include);
        });
        req.queryConfig = Object.assign({}, req.queryConfig, {include});
        next();
    }
}


module.exports = enableRelations;
