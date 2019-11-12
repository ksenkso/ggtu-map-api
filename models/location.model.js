'use strict';
// const debug = require('debug')('Model:Building');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Location
     * @extends Sequelize.Model
     */
    const Location = sequelize.define('Location', {
        name: DataTypes.STRING(100),
        floor: DataTypes.INTEGER
    }, {timestamps: false});

    Location.associate = function (models) {
        Location.hasMany(models.Place);
        Location.belongsTo(models.Building);
        Location.hasOne(models.Building, {as: 'StartLocation', allowNull: true, defaultValue: null, constraints: false});
    };

    return Location;
};
