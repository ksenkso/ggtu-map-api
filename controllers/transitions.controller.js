const debug = require('debug')('App:Controller:Transition');
const {ReS} = require('../services/util.service');
const {Transition, TransitionView} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {name, BuildingId, type, views = []} = req.body;
    const errors = [];
    if (!name) {
        errors.push(new Error('У перехода должно быть имя.'));
    }
    if (!BuildingId) {
        errors.push(new Error('Переход не привязан к зданию.'));
    }
    if (!errors.length) {
        try {
            const transition = await Transition.create({name, type, BuildingId, Views: views}, {include: [{association: 'Views'}]});
            debug('Transition created');
            const output = transition.toJSON();
            return ReS(res, output, 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const get = async function (req, res) {
    const id = req.params.id;
    const config = req.queryConfig;
    config.where = Object.assign({}, config.where, {id});
    config.include = config.include ? config.include : [{association: 'Views'}];
    const transition = await Transition.findOne(config);
    return ReS(res, transition.toJSON());
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        const model = await req.transition.update(req.body);
        return ReS(res, model.toJSON());
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const id = req.transition.id;
    try {
        await req.transition.destroy();
        return ReS(res, {id}, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;

const getAll = async function(req, res, next) {
    try {
        const config = req.queryConfig;
        config.include = config.include || [];
        const transitions = await Transition.findAll(config);
        if (transitions) {
            return ReS(res, transitions, 200);
        } else {
            return ReS(res, [], 404);
        }
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;


const addView = async function(req, res, next) {
    const id = +req.params.id;
    const {LocationId, container} = req.body;
    try {
        const view = await TransitionView.create({TransitionId: id, LocationId, container});
        return ReS(res, view.toJSON());
    } catch (e) {
        return next(e);
    }
};
module.exports.addView = addView;

