'use strict';

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

    WCProps.propsList = ['sex'];

    return WCProps;
};
