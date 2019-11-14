const debug = require('debug')('App:Controller:Place');
const {ReS} = require('../services/util.service');
const {Place, PlaceProps, MapObject} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {LocationId, name, type, coordinates} = req.body;
    let {props} = req.body;
    const errors = [];
    if (!LocationId) {
        errors.push(new Error('Место не привязано к локации.'));
    }
    if (!coordinates) {
        errors.push(new Error('Место не привязано к области карты.'));
    }
    if (!name) {
        errors.push(new Error('Место должно иметь название'));
    }
    if (!type) {
        errors.push(new Error('Место должно иметь тип'));
    }
    if (!errors.length) {
        try {
            /**
             * @type Place
             */
            const place = await Place.create({
                LocationId,
                name,
                type,
                geometry: {type: 'Polygon', coordinates},
                Props: PlaceProps.expandProps(props)
            }, {include: [{association: 'Props'}]});
            debug('created');

            return ReS(res, place.prepare(), 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const get = async function (req, res) {
    return ReS(res, req.place.prepare());
};
module.exports.get = get;

const update = async function (req, res, next) {
    const {id} = req.params;
    let {props} = req.body;
    delete req.body.props;
    if (req.body.coordinates) {
        req.body.geometry = {
            type: 'Polygon',
            coordinates: req.body.coordinates
        };
        delete req.body.coordinates;
    }
    try {
        const updated = await req.place.update(req.body);
        const output = updated.toJSON();
        if (props) {
            props = PlaceProps.expandProps(props);
            await PlaceProps.destroy({where: {PlaceId: id}});
            if (props.length) {
                await PlaceProps.bulkCreate(props.map(prop => {
                    prop.PlaceId = id;
                    return prop;
                }));
                output.props = PlaceProps.prepareProps(props);
                delete output.Props;
            } else {
                output.props = {};
            }
        } else {
            output.props = PlaceProps.prepareProps(await PlaceProps.findAll({where: {PlaceId: output.id}}));
        }
        return res.json(output);
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const id = req.place.id;
    try {
        await req.place.destroy();
        return ReS(res, {id}, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

const getAll = async function (req, res, next) {
    try {
        const include = {model: MapObject, attributes: ['id', 'PlaceId']};
        const config = Object.assign({}, {include}, req.queryConfig);
        let places = await Place.findAll(config);
        return res.json(places.map(p => p.prepare()));
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;
