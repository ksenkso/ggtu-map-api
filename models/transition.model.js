'use strict';

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
        Transition.prototype.getLocations = async function() {
            const query = `select * from Locations where id in (
            select LocationId from TransitionViews where TransitionId = ?
            );`;
            return sequelize.query(query, {model: models.Location, mapToModel: true, replacements: [this.id]})
        };
        Transition.addHook('beforeDestroy', async (transition) => {
            debug('Fetching views...');
            const views = await transition.getViews({include: [{model: models.Location}]});
            debug('Views fetched: ' + views.length);
            views.forEach(view => {
                debug('Removing view: ' + view.id);
                const location = view.Location;
                debug('View\' location: ' + view.Location.name);
                debug('View\'s geometry: ' + view.geometry);
                debug('View removed');
            });

        });
    };

    return Transition;
};
