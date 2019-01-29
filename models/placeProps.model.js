'use strict';

module.exports = (sequelize, DataTypes) => {
    /**
     * @class PlaceProps
     * @extends Sequelize.Model
     */
    const PlaceProps = sequelize.define('PlaceProps', {
        meta: DataTypes.TEXT
    });

    PlaceProps.associate = function (models) {
        PlaceProps.belongsTo(models.Place);
    };

    PlaceProps.propsList = ['meta'];


    return PlaceProps;
};
