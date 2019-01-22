const handleError = require("../services/util.service").handleError;
/**
 * @typedef {{
 *  modelClass: Sequelize.Model,
 *  hasPermission: Function<{model: Sequelize.Model, user: User}, Boolean>,
 *  [id]: String = 'id',
 *  [modelName]: String = 'grantedModel'
 *  [errorMessage]: String = 'You cannot access this resource.',
 *  [notFoundMessage]: String = 'Not found.'
 * }} AccessConfig
 */
/**
 *
 * @param {AccessConfig} config
 * @return {Function}
 */
module.exports = function (config) {
    config = Object.assign(
        {},
        {
            modelName: 'grantedModel',
            id: 'id',
            errorMessage: 'You cannot access this resource.',
            notFoundMessage: 'Not found.',
            relations: []
        },
        config
    );
    const func = async function (req, res, next) {
        this.config = config;
        const key = req.params[this.config.id];
        const user = req.user;
        try {
            const config = Object.assign({}, req.queryConfig);
            config.include = config.include ? config.include : this.config.relations;

            const model = await this.config.modelClass.findById(key, config);
            if (!model) {
                const error = new Error(this.config.notFoundMessage);
                error.status = 404;
                return handleError(error, next);
            }
            if (this.config.hasPermission({user, model})) {
                req[this.config.modelName] = model;
                next();
            } else {
                const error = new Error(this.config.errorMessage);
                error.status = 403;
                handleError(error, next);
            }
        } catch (e) {
            handleError(e, next);
        }
    };

    /**
     * Override previous configuration
     * @param {Object} newConfig
     * @return {*}
     */
    func.override = (newConfig) => {
        func.config = Object.assign({}, config, newConfig);
        return func;
    };

    return func;
};
