'use strict';
const debug = require('debug')('App:Model:Place');
// const {PlaceProps, GymProps, WCProps, CabinetProps} = require('./index');

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
        Place.hasMany(models.PlaceProps);
        Place.hasMany(models.CabinetProps);
        Place.hasMany(models.WCProps);
        Place.hasMany(models.GymProps);
    };
    Place.defineStatic = function (models) {
        Place.getPropsClass = function (type) {
            debug('Selecting dynamic model props class for type ' + type);
            switch (type) {
                case 'cabinet': {
                    return models.CabinetProps;
                }
                case 'wc': {
                    return models.WCProps;
                }
                case 'gym': {
                    return models.GymProps;
                }
                default: return models.PlaceProps;
            }
        };
    };



    return Place;
};
