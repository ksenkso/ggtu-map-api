'use strict';
const debug = require('debug')('App:Model:Building');
const {updateContainerOnMap} = require('../utils');

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
        container: {
            type: DataTypes.STRING(48)
        },
    });

    Building.associate = function (models) {
        Building.hasMany(models.Location, {as: 'Locations'});
    };

    Building.defineStatic = (models) => {
        Building.hook('afterSave', async (building, options) => {
            debug('afterSave');
            let shouldUpdate = false;
            for (let i = 0; i < options.fields.length; i++) {
                if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                debug('Id - ' + building.id);
                const location = await models.Location.findOne({where: {BuildingId: null}});
                updateContainerOnMap(location, building.container, {id: building.id});
            }
        });
        Building.hook('afterDestroy', async (building) => {
            debug('afterDestroy');
            debug('Id - ' + building.id);
            const location = await models.Location.findOne({where: {BuildingId: null}});
            updateContainerOnMap(location, building.container, {id: null});
        });
    };


    return Building;
};
