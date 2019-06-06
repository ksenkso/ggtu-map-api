const Vertex = require('./Vertex.js');

/**
 *
 * @param v
 * @return {PathVertex[]}
 */
function getPath(v) {
    const path = [];
    let node = v;
    while (node && node.parent) {
        path.push(node.parent);
        node = node.parent;
    }
    return path.reverse().concat(v);
}

/**
 *
 * @param {AdjacencyList} vertices
 */
function initGraph(vertices) {
    vertices.forEach(vertex => {
        vertex.parent = null;
        vertex.reachCost = Infinity;
        vertex.totalCost = Infinity;
        vertex.isClosed = false;
    });
}

/**
 *
 * @param {AdjacencyList} vertices
 * @param {string} startId
 * @param {string} endId
 * @return {PathVertex[] | boolean}
 */
module.exports = function aStar(vertices, startId, endId) {
    initGraph(vertices);
    const start = vertices.find(node => node.id === startId);
    const end = vertices.find(node => node.id === endId);
    start.reachCost = 0;
    start.totalCost = Vertex.distance(start, end);
    const open = [start];
    // const closed = [];
    while (open.length) {
        const current = minF(open);
        if (current === end) {
            return getPath(end);
        }
        open.splice(open.indexOf(current), 1);
        current.isClosed = true;
        const siblings = current.siblings.map(s => vertices[s.index]).filter(s => !s.isClosed);
        for (let sibling of siblings) {
            const tempG = current.reachCost + Vertex.distance(current, sibling);
            if (!open.includes(sibling) || tempG < sibling.reachCost) {
                sibling.parent = current;
                sibling.reachCost = tempG;
                sibling.totalCost = sibling.reachCost + Vertex.distance(sibling, end);
            }
            if (!open.includes(sibling)) {
                open.push(sibling);
            }
        }
    }
    return false;
};

function minF(list) {
    let item = list[0];
    let min = list[0].totalCost;
    for (let i = 1; i < list.length; i++) {
        if (list[i].totalCost < min) {
            item = list[i];
            min = item.totalCost;
        }
    }
    return item;
}
