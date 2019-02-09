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
        TransitionView.hook('afterSave', async (view) => {
            debug('afterSave');
            const location = await view.getLocation();
            updateContainerOnMap(location, view.container, {id: view.id, 'transition-id': view.TransitionId});
        });

        TransitionView.hook('afterDestroy', async (view) => {
            const location = await view.getLocation();
            updateContainerOnMap(location, view.container, {id: null, 'transition-id': null});
        });
    };

    return TransitionView;
};
