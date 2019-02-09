'use strict';

module.exports = (sequelize, DataTypes) => {
    /**
     * @class PlaceProps
     * @extends Sequelize.Model
     */
    const PlaceProps = sequelize.define('PlaceProps', {
        name: DataTypes.STRING(32),
        value: DataTypes.STRING(128)
    }, {timestamps: false});

    PlaceProps.associate = function (models) {
        PlaceProps.belongsTo(models.Place);
    };

    return PlaceProps;
};
