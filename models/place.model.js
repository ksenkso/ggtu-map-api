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
        Place.hasOne(models.MapObject);
        Place.prototype.prepare = function () {
            const place = this.toJSON();
            place.props = models.PlaceProps.prepareProps(place.Props);
            delete place.Props;
            return place;
        };
    };

    Place.addHook('afterSave', async (place, options) => {
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
            updateContainerOnMap(location, place.container, {id: place.id});
        }
    });

    Place.addHook('afterDestroy', async (place) => {
        const location = await place.getLocation();
        updateContainerOnMap(location, place.container, {id: null});
    });
    return Place;
};
