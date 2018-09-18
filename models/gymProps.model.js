'use strict';
const debug = require('debug')('Model:GymProps');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class GymProps
     * @extends Sequelize.Model
     */
    const GymProps = sequelize.define('GymProps', {
        hasTrainers: {
            type: DataTypes.BOOLEAN,
            default: 0
        }
    });

    GymProps.associate = function (models) {
        GymProps.belongsTo(models.Place);
    };

    return GymProps;
};
