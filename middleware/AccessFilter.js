const debug = require('debug')('App:AccessFilter');
/**
 * @typedef {{
 *     user: Object,
 *     [model]: Object
 * }} AccessData
 *
 * @typedef {{
 *     [modelName]: string | null,
 *     [id]: string,
 *     [errorMessage]: string,
 *     [notFoundMessage]: string,
 *     [include]: Array,
 *     [check]: Function<AccessData, boolean>
 * }} AccessConfig
 */

class AccessFilter {
    /**
     *
     * @return {AccessConfig}
     */
    static get defaultConfig() {
        return {
            modelName: 'grantedModel',
            id: 'id',
            errorMessage: 'You cannot access this resource.',
            notFoundMessage: 'Not found.',
            include: [],
            check() {
                return true;
            }
        }
    }

    /**
     *
     * @param {AccessConfig} config
     */
    constructor(config) {
        this.config = Object.assign({}, AccessFilter.defaultConfig, config);
    }

    createFilter(config = null) {
        if (!config) {
            config = this.config
        } else {
            config = Object.assign({}, this.config, config);
        }
        return async (req, res, next) => {
            const key = req.params[config.id];
            const user = req.user;
            try {
                // Data that is provided to access check method
                const accessData = {user};
                // Only query model when a model class is provided in the config
                debug('Checking model class');
                if (config.modelClass) {
                    debug('Model class provided: ' + config.modelClass.name);
                    const queryConfig = Object.assign({}, req.queryConfig);
                    // console.log(config);
                    // If includes are provided in query params, apply them
                    // Else use includes from the config
                    queryConfig.include = queryConfig.include ? queryConfig.include : config.include;
                    debug('Querying model...');
                    const model = await config.modelClass.findByPk(key, queryConfig);
                    debug(!!model ? 'Found' : 'Not found');
                    if (!model) {
                        debug('Throwing an error');
                        const error = new Error(config.notFoundMessage);
                        error.status = 404;
                        return next(error);
                    } else {
                        debug('Assigning model to access data');
                        accessData.model = model;
                    }
                }
                // Check if user has access to this resource
                debug('Check for permissions...');
                if (config.check(accessData)) {
                    debug('Check passed!');
                    // If model was queried, add it to  the req object
                    if (config.modelClass) {
                        debug('Model class is provided, assigning to request object.');
                        req[config.modelName] = accessData.model;
                    }
                    // Go to the next widdleware
                    debug('Done.');
                    next();
                } else {
                    debug('Check failed!');
                    const error = new Error(config.errorMessage);
                    error.status = 403;
                    debug('Throwing 403 error');
                    next(error);
                }
            } catch (e) {
                debug('Error! See logs');
                next(e);
            }
        }
    }
}
module.exports = AccessFilter;
