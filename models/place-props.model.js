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
        PlaceProps.WC = {
            MALE: 0,
            FEMALE: 1,
            getType(name) {
                return name === 'мужской' ? this.MALE : this.FEMALE;
            }
        };
        PlaceProps.BUILDING = {
            STUDY: 'study',
            LIVE: 'live',
            getType(name = 'корпус') {
                return name === 'корпус' ? this.STUDY : this.LIVE;
            }
        };
    };

    return PlaceProps;
};
