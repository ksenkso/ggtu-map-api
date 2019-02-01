'use strict';
const debug = require('debug')('App:Model:TransitionLinks');
module.exports = (sequelize, DataTypes) => {
    /**
     * @class TransitionLinks
     * @extends Sequelize.Model
     */
    const TransitionLinks = sequelize.define('TransitionLinks', {});

    TransitionLinks.associate = function (models) {
        TransitionLinks.belongsTo(models.Transition);
        TransitionLinks.belongsTo(models.Transition, {as: 'linked'});
    };

    return TransitionLinks;
};
