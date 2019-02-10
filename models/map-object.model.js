'use strict';
// const debug = require('debug')('App:Model:MapObject');

module.exports = (sequelize) => {
    /**
     * @class MapObject
     * @extends Sequelize.Model
     */
    const MapObject = sequelize.define('MapObject', {}, {timestamps: false});

    MapObject.associate = function (models) {
        MapObject.Place = MapObject.belongsTo(models.Place);
        MapObject.TransitionView = MapObject.belongsTo(models.TransitionView);
    };
    return MapObject;
};
