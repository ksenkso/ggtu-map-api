'use strict';
// const debug = require('debug')('App:Model:PathEdge');
const {Op} = require('sequelize');

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
    /**
     *
     * @param ids
     * @return {Promise<void>}
     */
    PathEdge.getEdgesBetween = function (ids) {
        return PathEdge.findAll({
            where: {
                [Op.or]: [
                    {StartId: {[Op.in]: ids}},
                    {EndId: {[Op.in]: ids}},
                ]
            },
        });
    };
    return PathEdge;
};
