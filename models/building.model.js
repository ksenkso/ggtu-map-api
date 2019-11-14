'use strict';

module.exports = (sequelize, DataTypes) => {
    /**
     * @class Building
     * @extends Sequelize.Model
     */
    const Building = sequelize.define('Building', {
        name: DataTypes.STRING,
        type: {
            type: DataTypes.STRING(16),
            defaultValue: 'study'
        },
        geometry: DataTypes.GEOMETRY('POLYGON'),
    });

    Building.associate = function (models) {
        Building.hasMany(models.Location);
    };

    return Building;
};
