const {Building, Place, Location, PlaceProps, PathVertex, PathEdge, sequelize} = require('../models');
const {Op} = require('sequelize');
const parse = require('../utils/search');
const aStar = require('../utils/paths/AStar');
const Vertex = require('../utils/paths/Vertex');
const {optimizePath} = require('../utils/optimizePath');
const {mergeToAdjacencyList, normalizePath} = require('../utils/paths');

const findPath = async function (req, res, next) {
    const {from: fromId, to: toId} = req.query;
    const from = await PathVertex.findOne({where: {ObjectId: fromId}});
    const to = await PathVertex.findOne({where: {ObjectId: toId}});
    let vertices, edges;
    if (from && to) {
        if (from.LocationId === to.LocationId) {
            vertices = await PathVertex.findAll({
                where: {LocationId: from.LocationId}
            });
            const ids = vertices.map(v => v.id);
            edges = await PathEdge.getEdgesBetween(ids);
        } else {
            const locations = await Location.findAll({where: {id: {[Op.or]: [from.LocationId, to.LocationId]}}});
            if (locations[0].BuildingId === locations[1].BuildingId) {
                const floors = await Location.findAll({
                    where: {
                        floor: {[Op.between]: [locations[0].floor, locations[1].floor].sort()},
                        BuildingId: locations[0].BuildingId
                    }
                });
                vertices = await PathVertex.findAll({
                    where: {LocationId: {[Op.in]: floors.map(f => f.id)}}
                });
                const ids = vertices.map(v => v.id);
                edges = await PathEdge.getEdgesBetween(ids);
            } else {

                if (locations[0].BuildingId !== null && locations[1].BuildingId !== null) {
                    // Route between two buildings
                    const pathLocations = await Location.findAll({
                        attributes: ['id', 'BuildingId'],
                        where: {
                            [Op.or]: [
                                {
                                    floor: {[Op.lte]: locations[1].floor},
                                    BuildingId: locations[1].BuildingId
                                },
                                {
                                    floor: {[Op.lte]: locations[0].floor},
                                    BuildingId: locations[0].BuildingId
                                }
                            ]
                        }
                    });
                    vertices = await PathVertex.findAll({
                        where: {
                            LocationId: {
                                [Op.in]: pathLocations.map(l => l.id)
                            }
                        }
                    });
                    edges = await PathEdge.getEdgesBetween(vertices.map(v => v.id));
                } else {
                    // Route from or to root location

                }
            }
        }
        const graph = mergeToAdjacencyList(vertices, edges).map(node => new Vertex(node));
        const path = aStar(graph, from.id, to.id);
        if (path) {
            res.json(optimizePath(normalizePath(path)));
        } else {
            const error = new Error('Путь не найден');
            error.status = 404;
            next(error);
        }
    } else {
        let message;
        if (!from) {
            message = 'Места с таким fromId не существует';
        } else {
            message = 'Места с таким toId не существует';
        }
        const error = new Error(message);
        error.status = 404;
        next(error);
    }

};
module.exports.findPath = findPath;

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

const find = async function (req, res, next) {
    try {
        const input = req.query.q;
        console.log(input);
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
                    return res.json([{place, location, building: building.toJSON()}]);
                } else {
                    const error = new Error('Кабинет не найден');
                    error.status = 404;
                    next(error);
                }
            } else {
                const error = new Error('Корпус не найден');
                error.status = 404;
                next(error);
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
                return res.json(result);
            } else {
                results.push(response);
            }
            return res.json(results);
        }
        return res.status(204);
    } catch (e) {
        return next(e);
    }
};
module.exports.find = find;
