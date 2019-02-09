const debug = require('debug')('App:Controller:Place');
const {ReS} = require('../services/util.service');
const {Place, PlaceProps} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {LocationId, name, type, container, Props} = req.body;
    const errors = [];
    if (!LocationId) {
        errors.push(new Error('Место не привязано к локации.'));
    }
    if (!container) {
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
            const place = await Place.create({LocationId, name, type, container, Props}, {include: [{association: 'Props'}]});
            debug('created');

            return ReS(res, place.toJSON(), 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const get = async function (req, res) {
    return ReS(res, req.place.toJSON());
};
module.exports.get = get;

const update = async function (req, res, next) {
    const id = req.params.id;
    const props = req.body.Props;
    delete req.body.props;
    try {
        const updated = await req.place.update(req.body);
        const output = updated.toJSON();
        if (props) {
            await PlaceProps.destroy({where: {PlaceId: id}});
            if (props.length) {
                const newProps = await PlaceProps.bulkCreate(props.map(prop => {prop.PlaceId = id; return prop;}));
                output.Props = newProps.map(p => ({name: p.name, value: p.value}));
            }
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
        // await Place.getPropsClass(place.type).destroy({where: {PlaceId: id}});
        await req.place.destroy();
        return ReS(res, {id}, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

const getAll = async function(req, res, next) {
    try {
        let places = await Place.findAll();
        return res.json(places.map(p => p.toJSON()));
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;
