'use strict';
// const debug = require('debug')('App:Model:PathEdge');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class PathEdge
     * @extends Sequelize.Model
     */
    const PathEdge = sequelize.define('PathEdge', {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    }, {timestamps: false});

    PathEdge.associate = function (models) {
        PathEdge.Start = PathEdge.belongsTo(models.PathVertex, {as: 'Start'});
        PathEdge.End = PathEdge.belongsTo(models.PathVertex, {as: 'End'});
    };
    return PathEdge;
};
