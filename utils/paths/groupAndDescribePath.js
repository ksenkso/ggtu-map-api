/**
 *
 * @param {PathVertex[]} path
 * @param {Location[]} locations
 * @param {number} MAX_ANGLE
 * @return {PathVertex[]}
 */
function groupAndDescribePath(path, locations = [], MAX_ANGLE = Math.PI / 18) {
    let curVector = {
        x: path[1].position.x - path[0].position.x,
        y: path[0].position.y - path[1].position.y, // flip y coordinate because on the map it goes down
        z: path[1].position.z - path[0].position.z,
    };
    const groups = [cleanVertex(path[0])];
    if (locations.length) {
        locations = locations.reduce((acc, floor) => {
            acc[floor.id] = floor;
            return acc;
        }, {});
    }
    for (let i = 2; i < path.length; i++) {
        const tempVector = {
            x: path[i].position.x - path[i - 1].position.x,
            y: path[i - 1].position.y - path[i].position.y,
            z: path[i].position.z - path[i - 1].position.z,
        };
        let angle = getAngle(curVector, tempVector);
        if (Math.abs(angle) > MAX_ANGLE) {
            // set the direction
            const vertex = cleanVertex(path[i - 1]);
            angle = getOrientedAngle(curVector, tempVector);
            vertex.angle = angle;
            if (angle > 0) {
                if (angle < Math.PI / 1.5) {
                    vertex.direction = 'Налево';
                } else {
                    vertex.direction = 'Развернуться налево';
                }

            } else {
                if (angle > -Math.PI / 1.5) {
                    vertex.direction = 'Направо';
                } else {
                    vertex.direction = 'Развернуться направо'
                }
            }
            const prevVertex = groups[groups.length - 1];
            if (prevVertex.LocationId !== vertex.LocationId) {
                prevVertex.direction = 'Переход';
                vertex.direction = 'Прямо';
                if (
                    locations[vertex.LocationId].Building
                    && locations[prevVertex.LocationId].Building
                    && locations[vertex.LocationId].Building.id === locations[prevVertex.LocationId].Building.id
                ) {
                    prevVertex.direction = 'Лестница';
                    prevVertex.description = locations[vertex.LocationId].name;
                    vertex.direction = 'Лестница';
                    vertex.description = locations[prevVertex.LocationId].name;
                }
                if (!locations[vertex.LocationId].Building) {
                    // if current vertex is in the root location, then check the previous one:
                    // if it is inside a building, then this vertex is an exit, else do nothing
                    if (locations[prevVertex.LocationId].Building) {
                        prevVertex.direction = 'Выход';
                        prevVertex.type = 'entrance';
                        prevVertex.description = locations[vertex.LocationId].name;
                    }
                } else {
                    // check previous vertex: if it is in the root location, the that vertex is an entrance
                    if (!locations[prevVertex.LocationId].Building) {
                        prevVertex.direction = 'Вход';
                        prevVertex.description = locations[vertex.LocationId].Building.name;
                    }
                }
            }
            groups.push(vertex);
        }
        curVector = tempVector;
    }
    groups.push(cleanVertex(path[path.length - 1]));
    return groups;
}

module.exports.groupAndDescribePath = groupAndDescribePath;

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
function getOrientedAngle(v1, v2) {
    return Math.atan2(v1.x * v2.y - v2.x * v1.y, v1.x * v2.x + v1.y * v2.y);
}

module.exports.getOrientedAngle = getAngle;

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
