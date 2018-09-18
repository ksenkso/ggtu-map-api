'use strict';
const debug = require('debug')('Model:WCProps');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class WCProps
     * @extends Sequelize.Model
     */
    const WCProps = sequelize.define('WCProps', {
        sex: {
            type: DataTypes.ENUM('male', 'female'),
            default: 'male'
        }
    });

    WCProps.associate = function (models) {
        WCProps.belongsTo(models.Place);
    };

    return WCProps;
};
