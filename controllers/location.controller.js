const fs = require('fs');
const path = require('path');
const debug = require('debug')('App:Locations');
const uuidv4 = require('uuid/v4');
const {ReS} = require('../services/util.service');
const {Location, Place, Building} = require('../models');

const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {name, map, BuildingId} = req.body;
    const errors = [];
    if (!name) {
        errors.push(new Error('Укажите название локации.'))
    }
    if (!errors.length) {
        try {
            /**
             * @type Location
             */
            const location = await Location.create({name, map, BuildingId});

            const output = location.toJSON();
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
    try {
        const config = Object.assign({}, req.queryConfig);
        config.include = config.include || [{
            model: Building,
            attributes: ['name']
        }];
        let locations = await Location.findAll(config);
        locations = locations ? locations.map(l => l.toJSON()) : [];
        return ReS(res, locations, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;

const getPlaces = async function(req, res, next) {
    try {
        const config = Object.assign({}, req.queryConfig);
        debug(config);
        const LocationId = req.params.id;
        config.where = config.where ? Object.assign(config.where, {LocationId}) : {LocationId};
        debug(config);
        let places = await Place.findAll(config);
        places = places ? places.map(p => p.toJSON()) : [];
        return ReS(res, places, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.getPlaces = getPlaces;

const get = async function (req, res) {
    let location = req.location;
    return ReS(res, location.toJSON(), 200);
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        const location = await req.location.update(req.body);
        return ReS(res, location.toJSON());
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const location = req.location, id = location.id;
    try {
        await location.destroy();
        return ReS(res, {id}, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

const upload = async function(req, res, next) {
    const errors = [];
    if (!req.files) {
        errors.push(new Error('Загрузите файл.'));
        return next(errors);
    }
    const file = req.files.map;
    if (!file) {
        errors.push(new Error('Загрузите файл.'));
    } else if (file.mimetype !== 'image/svg+xml') {
        errors.push(new Error('Файл карты должен быть в формате SVG, получено: ' + file.mimetype))
    }
    if (!errors.length) {
        const location = req.location;
        if (location.map) {
            try {
                await new Promise((resolve, reject) => {
                    fs.unlink(path.join(MAPS_PATH, location.map), err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            } catch (e) {
                next(e);
            }
        }
        const map = `${uuidv4()}.svg`;
        const [err] = await Promise.all([
            file.mv('maps/' + map),
            req.location.update({map})
        ]);
        if (err) {
            next(err);
        } else {
            return ReS(res, location, 200);
        }
    } else {
        return next(errors);
    }
};
module.exports.upload = upload;
