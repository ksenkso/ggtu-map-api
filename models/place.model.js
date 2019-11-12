'use strict';
const debug = require('debug')('App:Model:Place');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Place
     * @extends Sequelize.Model
     */
    const Place = sequelize.define('Place', {
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        geometry: DataTypes.GEOMETRY('POLYGON')
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
    return Place;
};
