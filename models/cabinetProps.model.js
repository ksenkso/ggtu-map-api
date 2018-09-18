'use strict';
const debug = require('debug')('Model:CabinetProps');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class CabinetProps
     * @extends Sequelize.Model
     */
    const CabinetProps = sequelize.define('CabinetProps', {
        hasProjector: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        isComputerClass: {
            type: DataTypes.BOOLEAN,
            default: 0
        },
        isBig: {
            type: DataTypes.BOOLEAN,
            default: 0
        }
    });

    CabinetProps.associate = function (models) {
        CabinetProps.belongsTo(models.Place);
    };

    return CabinetProps;
};
