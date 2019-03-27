'use strict';

module.exports = (sequelize, DataTypes) => {
    /**
     * @class PlaceProps
     * @extends Sequelize.Model
     * @property {String} name
     * @property {String} value
     * @property {Number} id
     * @property {Number} PlaceId
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
        /**
         *
         * @param {PlaceProps[]} Props
         */
        PlaceProps.prepareProps = (Props) => {
            const props = {};
            if (Props && Props.length) {
                Props.forEach(prop => {
                    props[prop.name] = prop.value;
                });
            }
            return props;
        };
        /**
         *
         * @param {Object} props
         * @return {{name: string, value: *}[]}
         */
        PlaceProps.expandProps = (props = {}) => {
            return Object.keys(props).map(key => ({name: key, value: props[key]}));
        };
    };

    return PlaceProps;
};
