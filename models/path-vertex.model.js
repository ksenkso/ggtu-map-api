'use strict';
// const debug = require('debug')('App:Model:PathVertex');

module.exports = (sequelize, DataTypes) => {
    /**
     * @class PathVertex
     * @extends Sequelize.Model
     */
    const PathVertex = sequelize.define('PathVertex', {
        x: DataTypes.INTEGER(),
        y: DataTypes.INTEGER(),
        z: {
            type: DataTypes.INTEGER(),
            defaultValue: 0
        }
    }, {tableName: 'PathVertices', timestamps: false});

    PathVertex.associate = function (models) {
        PathVertex.Object = PathVertex.belongsTo(models.MapObject, {as: 'Object'});
        PathVertex.Location = PathVertex.belongsTo(models.Location);
    };
    return PathVertex;
};
