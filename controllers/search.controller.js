const {Building, Place, Location, PlaceProps, PathVertex, PathEdge, TransitionView, MapObject, Transition, sequelize} = require('../models');
const {Op} = require('sequelize');
const parse = require('../utils/search');
const aStar = require('../utils/paths/AStar');
const {groupAndDescribePath} = require('../utils/paths/groupAndDescribePath');
const {mergeToAdjacencyList} = require('../utils/paths');

const findPathByIds = async function (req, res, next) {
    try {
        const path = await getPath(req.query.fromId, req.query.toId);
        return res.json(path);
    } catch (e) {
        next(e);
    }
};
module.exports.findPathByIds = findPathByIds;

const findPath = async function (req, res, next) {
    const fromName = req.query.from;
    const toName = req.query.to;
    let fromObject, toObject;
    try {
        const from = await performSearch(fromName);
        const to = await performSearch(toName);
        fromObject = await getResultMapObject(from[0]);
        toObject = await getResultMapObject(to[0]);
    } catch (e) {
        return next(e);
    }
    if (!fromObject || !toObject) {
        const error = new Error('Места не найдены');
        error.status = 404;
        return next(error);
    }
    try {
        const path = await getPath(fromObject.id, toObject.id);
        if (path) {
            return res.json(path);
        } else {
            return res.json([]);
        }
    } catch (e) {
        next(e);
    }
};
module.exports.findPath = findPath;

const find = async function (req, res, next) {
    try {
        const input = req.query.q;
        const results = await performSearch(input);
        if (results.length) {
            res.json(results);
        } else {
            const error = new Error('Место не найдено');
            error.status = 404;
            return next(error);
        }
    } catch (e) {
        return next(e);
    }
};
module.exports.find = find;

/**
 *
 * @param {Object} result
 * @return {Promise<MapObject>}
 */
async function getResultMapObject(result) {
    if (result.place) {
        return await MapObject.findOne({where: {PlaceId: result.place.id}});
    } else {
        if (result.location) {
            const view = await TransitionView.findOne({
                where: {LocationId: result.location.id},
                include: [{model: MapObject}]
            });
            if (view) {
                return view.MapObject;
            }
        } else if (result.building) {
            const entrance = await TransitionView.findOne({
                include: [
                    {model: Transition, where: {type: 'exit', BuildingId: result.building.id}},
                    {model: MapObject}
                ],
                // attributes: ['id']
            });
            if (entrance) {
                return entrance.MapObject;
            }
        }
    }
}

/**
 *
 * @param {Number} fromId
 * @param {Number} toId
 * @return {Promise<PathVertex[]|void>}
 */
async function getPath(fromId, toId) {
    const from = await PathVertex.findOne({where: {ObjectId: fromId}});
    const to = await PathVertex.findOne({where: {ObjectId: toId}});
    let vertices, edges, pathLocations;
    if (from && to) {
        if (from.LocationId === to.LocationId) {
            // places are in the same location
            vertices = await PathVertex.findAll({
                where: {LocationId: from.LocationId}
            });
        } else {
            const locations = await Location.findAll({where: {id: {[Op.or]: [from.LocationId, to.LocationId]}}});
            if (locations[0].BuildingId === locations[1].BuildingId) {
                // places are in the same building
                pathLocations = await Location.findAll({
                    where: {
                        floor: {[Op.between]: [locations[0].floor, locations[1].floor].sort()},
                        BuildingId: locations[0].BuildingId
                    }
                });
                vertices = await PathVertex.findAll({
                    where: {LocationId: {[Op.in]: pathLocations.map(f => f.id)}}
                });
            } else {
                // the most common situation
                // path locations = all locations that should be visited
                // between first and last locations including them
                pathLocations = await Location.findAll({
                    attributes: ['id', 'BuildingId', 'name'],
                    where: {
                        [Op.or]: [
                            {
                                floor: {[Op.lte]: locations[1].floor},
                                BuildingId: locations[1].BuildingId
                            },
                            {
                                floor: {[Op.lte]: locations[0].floor},
                                BuildingId: locations[0].BuildingId
                            },
                            {
                                BuildingId: null
                            }
                        ]
                    },
                    include: {
                        model: Building,
                        attributes: ['name']
                    }
                });
                // vertices = all vertices in found locations
                vertices = await PathVertex.findAll({
                    where: {
                        LocationId: {
                            [Op.in]: pathLocations.map(l => l.id)
                        }
                    }
                });
            }
        }
        edges = await PathEdge.getEdgesBetween(vertices.map(v => v.id));
        const graph = mergeToAdjacencyList(vertices, edges); //create a graph to search in
        const path = aStar(graph, from.id, to.id); // use A* to find the path
        if (path) {
            // shrink the path to only valuable segments and add additional information to vertices
            return groupAndDescribePath(path, pathLocations);
        } else {
            const error = new Error('Путь не найден');
            error.status = 404;
            throw error;
        }
    }
}

/**
 *
 * @param {Place} item
 * @param {Location} location
 * @param {Building} building
 * @return {Promise<{location: Location, place: Place, building: Building}[]>}
 */
async function findPlacesInContext(item, {location, building} = {}) {
    // Find places in specified location
    // Places are searched by name with LIKE clause or levenshtein function call
    const config = {
        include: [{
            model: Location
        }]
    };
    switch (item.placeType) {
        case 'wc': {
            config.where = {
                type: 'wc',
            };
            config.include.push({
                model: PlaceProps,
                as: 'Props',
                where: {
                    name: 'sex',
                    value: item.sex
                }
            });
            break;
        }
        case 'cabinet': {
            if (item.number) {
                config.where = {
                    name: {
                        [Op.like]: `%${item.number}%`
                    }
                };
            } else {
                config.attributes = {include: [[sequelize.fn('levenshtein', item.name, sequelize.col('Place.name')), 'distance']]};
                config.having = {
                    distance: {
                        [Op.lt]: 3
                    }
                };
            }
            break;
        }
        default: {
            config.attributes = {include: [[sequelize.fn('levenshtein', item.name, sequelize.col('Place.name')), 'distance']]};
            config.having = {
                distance: {
                    [Op.lt]: 3
                }
            };
        }
    }
    /*if (item.number) {
        config.where = {
            name: {
                [Op.like]: `%${item.number}%`
            }
        };
    } else {
        config.attributes = {include: [[sequelize.fn('levenshtein', item.name, sequelize.col('Place.name')), 'distance']]};
        config.having = {
            distance: {
                [Op.lt]: 3
            }
        };
    }*/
    if (location) {
        config.where = {
            LocationId: location.id
        };
        const places = await Place.findAll(config);
        if (places && places.length) {
            return places.map(place => {
                const data = place.toJSON();
                delete data.Location;
                return {
                    location,
                    building,
                    place: data
                };
            });
        }
    }
    if (building) {
        config.include[0].where = {
            BuildingId: building.id
        };
        const places = await Place.findAll(config);
        if (places && places.length) {
            return places.map(place => {
                const data = place.toJSON();
                const placeLocation = data.Location;
                delete data.Location;
                return {
                    location: placeLocation,
                    building,
                    place: data
                };
            });
        }
    }
    if (!(location || building)) {
        config.include[0].include = [{model: Building}];
        const places = await Place.findAll(config);
        if (places && places.length) {
            return places.map(place => {
                const data = place.toJSON();
                const placeLocation = data.Location;
                const placeBuilding = placeLocation.Building;
                delete data.Location;
                delete placeLocation.Building;
                return {
                    location: placeLocation,
                    building: placeBuilding,
                    place: data
                };
            });
        }
    }
    return [];

}

/**
 *
 * @param input
 * @return {Promise<Array>}
 */
async function performSearch(input) {
    const parsed = parse(input);
    const address = {};
    parsed.forEach(item => {
        address[item.type] = item;
    });
    if (parsed.length === 1 && parsed[0].type === 'shortAddress') {
        const building = await Building.find({
            where: {
                type: parsed[0].building.buildingType,
                name: {[Op.like]: `%${+parsed[0].building.number}%`}
            }
        });
        if (building) {
            const cabinet = await Place.find({
                where: {
                    type: 'cabinet',
                    name: {[Op.like]: `%${+parsed[0].cabinet.number}%`},
                },
                include: [{model: Location, where: {BuildingId: building.id}}]
            });
            if (cabinet) {
                console.log(cabinet);
                const place = cabinet.toJSON();
                const location = cabinet.Location;
                delete place.Location;
                return [{place, location, building: building.toJSON()}];
            } else {
                const error = new Error('Кабинет не найден');
                error.status = 404;
                throw error;
            }
        } else {
            const error = new Error('Корпус не найден');
            error.status = 404;
            throw error;
        }
    } else {
        // Handle other cases
        const results = [];
        const response = {};
        if (address.building) {
            const building = await Building.findOne({
                where: {
                    type: address.building.buildingType,
                    name: {[Op.like]: `%${address.building.number}%`}
                }
            });
            if (building) {
                response.building = building.toJSON();
            } else {
                console.log('no building');
            }
        }
        if (address.location) {
            const config = {
                where: {
                    floor: address.location.floor
                }
            };
            if (response.building) {
                config.where.BuildingId = response.building.id;
            }
            const location = await Location.findOne(config);
            if (location) {
                response.location = location.toJSON();
            }
        }
        if (address.place) {
            let result = await findPlacesInContext(address.place, {
                location: response.location,
                building: response.building
            });
            if (!result.length) {
                result = await findPlacesInContext(address.place, {building: response.building});
                if (!result.length) {
                    result = await findPlacesInContext(address.place);
                }
            }
            return result;
        } else {
            results.push(response);
        }
        return results;
    }
}

