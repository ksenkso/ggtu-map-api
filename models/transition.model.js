'use strict';
const {updateContainerOnMap} = require('../utils');

const debug = require('debug')('App:Model:Transition');
module.exports = (sequelize, DataTypes) => {
    /**
     * @class Transition
     * @extends Sequelize.Model
     */
    const Transition = sequelize.define('Transition', {
        name: DataTypes.STRING(48),
        type: DataTypes.STRING(20)
    }, {timestamps: false});

    Transition.associate = function (models) {
        Transition.belongsTo(models.Building);
        Transition.hasMany(models.TransitionView, {as: 'Views'});
    };

    Transition.defineStatic = (models) => {
        Transition.hook('beforeDestroy', async (transition) => {
            debug('Fetching views...');
            const views = await transition.getViews({include: [{model: models.Location}]});
            debug('Views fetched: ' + views.length);
            views.forEach(view => {
                debug('Removing view: ' + view.id);
                const location = view.Location;
                debug('View\' location: ' + view.Location.name);
                debug('View\'s container: ' + view.container);
                updateContainerOnMap(location, view.container, {});
                debug('View removed');
            });

        });
    };

    return Transition;
};
