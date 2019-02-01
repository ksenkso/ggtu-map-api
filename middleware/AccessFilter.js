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
            include: []
        }
    }

    /**
     *
     * @param {AccessConfig} config
     */
    constructor(config) {
        this.config = Object.assign({}, AccessFilter.defaultConfig, config);
        this.filter = this.filter.bind(this);
    }

    override(config) {
        this.config = Object.assign({}, this.config, config);
        return this.filter.bind(this);
    }

    check() {
        return true;
    }

    async filter(req, res, next) {
        const key = req.params[this.config.id];
        const user = req.user;
        try {
            // Data that is provided to access check method
            const accessData = {user};
            // Only query model when a model class is provided in the config
            if (this.config.modelClass) {
                const queryConfig = Object.assign({}, req.queryConfig);
                // console.log(this.config);
                // If includes are provided in query params, apply them
                // Else use includes from the config
                queryConfig.include = queryConfig.include ? queryConfig.include : this.config.include;
                const model = await this.config.modelClass.findById(key, queryConfig);
                if (!model) {
                    const error = new Error(this.config.notFoundMessage);
                    error.status = 404;
                    return next(error);
                } else {
                    accessData.model = model;
                }
            }
            // Check if user has access to this resource
            if (this.check(accessData)) {
                // If model was queried, add it to  the req object
                if (this.config.modelClass) {
                    req[this.config.modelName] = accessData.model;
                }
                // Go to the next widdleware
                next();
            } else {
                const error = new Error(this.config.errorMessage);
                error.status = 403;
                next(error);
            }
        } catch (e) {
            next(e);
        }
    }
}
module.exports = AccessFilter;
