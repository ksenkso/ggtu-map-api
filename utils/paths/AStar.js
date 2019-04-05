const Vertex = require('./Vertex.js');

/**
 *
 * @param v
 * @return {Vertex[]}
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
 * @param {Vertex[]} graph
 * @param {string} startId
 * @param {string} endId
 * @return {Vertex[]|boolean}
 */
module.exports = function aStar(graph, startId, endId) {
    const start = graph.find(node => node.id === startId);
    const end = graph.find(node => node.id === endId);
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
        const siblings = current.siblings.map(s => graph[s.index]).filter(s => !s.isClosed);
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
