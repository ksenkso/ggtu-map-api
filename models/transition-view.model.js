'use strict';
const debug = require('debug')('App:Model:TransitionView');
const {updateContainerOnMap} = require('../utils');
module.exports = (sequelize, DataTypes) => {
    /**
     * @class TransitionView
     * @extends Sequelize.Model
     */
    const TransitionView = sequelize.define('TransitionView', {
        container: DataTypes.STRING(48)
    }, {timestamps: false});


    TransitionView.associate = function (models) {
        TransitionView.belongsTo(models.Location);
        TransitionView.belongsTo(models.Transition);
    };

    TransitionView.defineStatic = () => {
        TransitionView.hook('afterSave', async (view, options) => {
            debug('afterSave');
            let shouldUpdate = false;
            for (let i = 0; i < options.fields.length; i++) {
                if (options.fields[i] === 'id' || options.fields[i] === 'container') {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                const location = await view.getLocation();
                updateContainerOnMap(location, view.container, view.TransitionId);
            }
        });

        TransitionView.hook('afterDestroy', async (view) => {
            const location = await view.getLocation();
            updateContainerOnMap(location, view.container);
        })
    };

    return TransitionView;
};
