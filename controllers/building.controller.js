const {ReS} = require('../services/util.service');
const {Building, Location, Transition} = require('../models');

const getAllForBuilding = async function(req, res, next) {
    try {
        const BuildingId = req.params.id;
        let locations = await Location.findAll({where: {BuildingId}});
        locations = locations ? locations.map(b => b.toJSON()) : [];
        return ReS(res, locations);
    } catch (e) {
        next(e);
    }
};
module.exports.getAllForBuilding = getAllForBuilding;
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {type, name, container} = req.body;
    const errors = [];
    if (!errors.length) {
        try {
            /**
             * @type Building
             */
            const building = await Building.create({type, name, container});
            const output = building.toJSON();
            return ReS(res, output, 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const getAll = async function(req, res, next) {
    const include = [
        {
            model: Location,
            attributes: ['id', 'name', 'map']
        }
    ];
    const config = Object.assign({}, {include}, req.queryConfig);
    try {
        const buildings = await Building.findAll(config);
        return ReS(res, buildings.map(b => b.toJSON()));
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;

const get = async function (req, res) {
    let building = req.building;
    return ReS(res, building.toJSON());
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        await req.building.update(req.body);
        return ReS(res, req.building.toJSON());
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const building = req.building, id = building.id;
    try {
        await building.destroy();
        return ReS(res, id, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

const getTransitions = async function(req, res, next) {
    const id = req.params.id;
    try {
        const transitions = await Transition.findAll({where: {BuildingId: id}}) || [];
        return res.json(transitions.map(t => t.toJSON()));
    } catch (e) {
        next(e);
    }

};
module.exports.getTransitions = getTransitions;

const floors = async function (req, res, next) {
    const {id, floor} = req.params;
    const location = await Location.findOne({
        where: {
            BuildingId: id,
            floor
        }
    });
    if (location) {
        return res.json(location.toJSON());
    } else {
        const error = new Error('Этаж не найден');
        error.status = 404;
        next(error);
    }
};
module.exports.floors = floors;
