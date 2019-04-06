/**
 *
 * @param {PathVertex} path
 * @param {number} MAX_ANGLE
 * @return {PathVertex[]}
 */
function optimizePath(path, MAX_ANGLE = Math.PI/18) {
    let curVector = {
        x: path[1].position.x - path[0].position.x,
        y: path[1].position.y - path[0].position.y
    };
    let currentGroup = [path[1]];
    const groups = [[path[0]]];
    for (let i = 2; i < path.length; i++) {
        const tempVector = {
            x: path[i].position.x - path[i - 1].position.x,
            y: path[i].position.y - path[i - 1].position.y,
        };
        const angle = getAngle(curVector, tempVector);
        if (Math.abs(angle) > MAX_ANGLE) {
            groups.push(currentGroup);
            currentGroup = [path[i-1]];
        } else {
            currentGroup.push(path[i]);
        }
        curVector = tempVector;
    }
    groups.push(currentGroup);
    return groups.map(group => group[0]);
}
module.exports.optimizePath = optimizePath;

function getAngle(v1, v2) {
    return Math.acos(dot(v1, v2) / length(v1) / length(v2));
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function length(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}
