'use strict';
const debug = require('debug')('App:Model:Transition');
const {updateContainerOnMap} = require('../utils');
module.exports = (sequelize, DataTypes) => {
    /**
     * @class Transition
     * @extends Sequelize.Model
     */
    const Transition = sequelize.define('Transition', {
        container: DataTypes.STRING(48)
    });

    Transition.associate = function (models) {
        Transition.belongsTo(models.Location);
        Transition.hasMany(models.TransitionLinks);
    };

    Transition.defineStatic = () => {
        Transition.hook('afterSave', async (transition, options) => {
            debug('afterSave');
            let shouldUpdate = false;
            for (let i = 0; i < options.fields.length; i++) {
                if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                const location = await transition.getLocation();
                updateContainerOnMap(location, transition.container, transition.id);
            }
        });

        Transition.hook('afterDestroy', async (transition) => {
            const location = await transition.getLocation();
            updateContainerOnMap(location, transition.container);
        })
    };

    return Transition;
};
