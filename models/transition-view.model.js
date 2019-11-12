'use strict';
const debug = require('debug')('App:Model:TransitionView');
const {updateContainerOnMap} = require('../utils');
module.exports = (sequelize, DataTypes) => {
    /**
     * @class TransitionView
     * @extends Sequelize.Model
     */
    const TransitionView = sequelize.define('TransitionView', {
        geometry: DataTypes.GEOMETRY('POLYGON')
    }, {timestamps: false});


    TransitionView.associate = function (models) {
        TransitionView.belongsTo(models.Location);
        TransitionView.belongsTo(models.Transition);
        TransitionView.hasOne(models.MapObject);
    };


    return TransitionView;
};
