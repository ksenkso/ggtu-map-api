'use strict';
const debug = require('debug')('App:Model:Place');
const {updateContainerOnMap} = require('../utils');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Place
     * @extends Sequelize.Model
     */
    const Place = sequelize.define('Place', {
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        container: DataTypes.STRING(8)
    });

    Place.associate = function (models) {
        Place.belongsTo(models.Location);
        Place.hasMany(models.PlaceProps, {as: 'Props'});
    };

    Place.hook('afterSave', async (place, options) => {
        debug('afterSave');
        let shouldUpdate = false;
        for (let i = 0; i < options.fields.length; i++) {
            if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                shouldUpdate = true;
                break;
            }
        }
        if (shouldUpdate) {
            const location = await place.getLocation();
            updateContainerOnMap(location, place.container, place.id);
        }
    });

    Place.hook('afterDestroy', async (place) => {
        const location = await place.getLocation();
        updateContainerOnMap(location, place.container);
    });
    return Place;
};
