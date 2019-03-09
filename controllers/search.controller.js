const {Building, Place, Location, sequelize} = require('../models');
const {Op} = require('sequelize');
const parse = require('ggtu-search-utils');

async function findPlacesInContext(item, {location, building} = {}) {
    // Find places in specified location
    // Places are searched by name with LIKE clause or levenshtein function call
    const config = {
        include: [{
            model: Location
        }]
    };
    if (item.number) {
        config.where = {
            name: {
                [Op.like]: `%${item.number}%`
            }
        }
    } else {
        config.attributes = {include: [[sequelize.fn('levenshtein', item.name, sequelize.col('Place.name')), 'distance']]};
        config.having = {
            distance: {
                [Op.lt]: 3
            }
        }
    }
    if (location) {
        if (!config.where) {
        }
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
                }
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
                }
            })
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
                }
            })
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
                    type: parsed[0].building.type,
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
        return next(e)
    }
};
module.exports.find = find;
