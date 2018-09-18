const authService = require('../services/auth.service');
const {ReS, handleError} = require('../services/util.service');
const pe = require('parse-error');
const {Building} = require('../models');
// const debug = require('debug')('Auth');

const getAllForBuilding = async function(req, res, next) {
    const BuildingId = req.params.buildingId;
    let floors = await Location.findAll({where: {BuildingId}});
    floors = floors ? floors.map(b => b.toJSON()) : [];
    return ReS(res, {floors});
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
    const {type, name} = req.body;
    const errors = [];
    if (!errors.length) {
        try {
            /**
             * @type Building
             */
            const building = await Building.create({type, name});
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
    const buildings = await Building.findAll();
    return ReS(res, {buildings: buildings.map(b => b.toJSON())});
};
module.exports.getAll = getAll;

const get = async function (req, res) {
    let building = req.building;
    return ReS(res, {building: building.toJSON()});
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        await req.building.update(req.body);
        return ReS(res, {building: req.building.toJSON()});
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const building = req.building, id = building.id;
    try {
        await building.destroy();
        return ReS(res, {id}, 204);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

