'use strict';
// const debug = require('debug')('App:Model:PathEdge');

module.exports = (sequelize) => {
    /**
     * @class PathEdge
     * @extends Sequelize.Model
     */
    const PathEdge = sequelize.define('PathEdge', {}, {timestamps: false});

    PathEdge.associate = function (models) {
        PathEdge.Start = PathEdge.belongsTo(models.PathVertex, {as: 'Start'});
        PathEdge.End = PathEdge.belongsTo(models.PathVertex, {as: 'End'});
    };
    return PathEdge;
};
