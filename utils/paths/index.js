const {PathVertex, MapObject, PathEdge} = require('../../models');
const {Op} = require('sequelize');

/**
 *
 * @param LocationId
 * @return {Promise<AdjacencyList>}
 */
async function getLocationGraph(LocationId) {
    const expandedVertices = await PathVertex.findAll({
        where: {LocationId},
        include: {
            association: PathVertex.Object,
            include: [{
                association: MapObject.Place,
                attributes: ['name', 'type', 'container']
            }, {association: MapObject.TransitionView, attributes: ['container', 'TransitionId']}]
        },
        attributes: ['id', 'x', 'y', 'z']
    });
    const ids = expandedVertices.map(v => v.id);
    const edges = await PathEdge.findAll({
        where: {
            [Op.or]: [
                {StartId: {[Op.in]: ids}},
                {EndId: {[Op.in]: ids}},
            ]
        },
    }).map(e => e.toJSON());
    const vertices = expandedVertices.map(v => {
        const entry = v.toJSON();
        if (entry.Object) {
            if (entry.Object.Place) {
                entry.type = 'Place';
                entry.Place = entry.Object.Place;
                delete entry.Object.TransitionView;
            }
            if (entry.Object.TransitionView) {
                entry.type = 'TransitionView';
                entry.TransitionView = entry.Object.TransitionView;
                delete entry.Object.Place;
            }
        }
        return entry;
    });
    return mergeToAdjacencyList(vertices, edges);
}

module.exports.getLocationGraph = getLocationGraph;

/**
 *
 * @param vertices
 * @param edges
 * @return {Array}
 */
function mergeToAdjacencyList(vertices, edges) {
    return vertices.map(vertex => {
        const entry = {
            position: {x: vertex.x, y: vertex.y, z: vertex.z},
            Object: vertex[vertex.type],
            type: vertex.type,
            siblings: [],
            id: vertex.id,
            LocationId: vertex.LocationId
        };
        edges.forEach(edge => {
            const connection = edge.StartId === vertex.id ? 'EndId' : edge.EndId === vertex.id ? 'StartId' : null;
            if (connection) {
                const sibling = {
                    index: vertices.findIndex(v => v.id === edge[connection]),
                    id: edge.id
                };
                if (sibling.index !== -1) {
                    entry.siblings.push(sibling);
                }
            }
        });
        return entry;
    });
}

module.exports.mergeToAdjacencyList = mergeToAdjacencyList;

/**
 *
 * @param {PathVertex[]} path
 */
function normalizePath(path) {
    return path.map(v => ({id: v.id, position: v.position}));
}
module.exports.normalizePath = normalizePath;
