/**
 *
 * @param {PathVertex[]} path
 * @param {number} MAX_ANGLE
 * @return {PathVertex[]}
 */
function optimizePath(path, MAX_ANGLE = Math.PI / 18) {
    let curVector = {
        x: path[1].position.x - path[0].position.x,
        y: path[1].position.y - path[0].position.y,
        z: path[1].position.z - path[0].position.z,
    };
    const groups = [cleanVertex(path[0])];
    for (let i = 2; i < path.length; i++) {
        const tempVector = {
            x: path[i].position.x - path[i - 1].position.x,
            y: path[i].position.y - path[i - 1].position.y,
            z: path[i].position.z - path[i - 1].position.z,
        };
        const angle = getAngle(curVector, tempVector);
        if (Math.abs(angle) > MAX_ANGLE) {
            groups.push(cleanVertex(path[i - 1]));
        }
        curVector = tempVector;
    }
    groups.push(cleanVertex(path[path.length - 1]));
    return groups;
}

module.exports.optimizePath = optimizePath;

function cleanVertex(vertex) {
    delete vertex.parent;
    delete vertex.reachCost;
    delete vertex.totalCost;
    delete vertex.isClosed;
    return vertex;
}
/**
 *
 * @param {Point3D} v1
 * @param {Point3D} v2
 * @return {number}
 */
function getAngle(v1, v2) {
    return Math.acos(dot(v1, v2) / length(v1) / length(v2));
}

module.exports.getAngle = getAngle;

/**
 *
 * @param {Point3D} v1
 * @param {Point3D} v2
 * @return {number}
 */
function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

module.exports.dot = dot;

/**
 *
 * @param {Point3D} v
 * @return {number}
 */
function length(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}

module.exports.length = length;
