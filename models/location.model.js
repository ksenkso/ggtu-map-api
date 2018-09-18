'use strict';
const debug = require('debug')('Model:Building');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Location
     * @extends Sequelize.Model
     */
    const Location = sequelize.define('Location', {
        map: DataTypes.STRING(10),
        name: DataTypes.STRING(100)
    });

    Location.associate = function (models) {
        Location.hasMany(models.Place);
        Location.belongsTo(models.Building);
    };

    return Location;
};
