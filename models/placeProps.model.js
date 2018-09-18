'use strict';
const debug = require('debug')('Model:Building');

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


    return PlaceProps;
};
