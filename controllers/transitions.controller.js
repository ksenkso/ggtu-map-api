const debug = require('debug')('App:Controller:Transition');
const {ReS} = require('../services/util.service');
const {Transition} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {LocationId, inId, outId, container} = req.body;
    const errors = [];
    if (!LocationId) {
        errors.push(new Error('Переход не привязан к локации.'));
    }
    if (!container) {
        errors.push(new Error('Переход не привязан к области карты.'));
    }
    if (!errors.length) {
        try {
            /**
             * @type Transition
             */
            const transition = await Transition.create({LocationId, inId, outId, container});
            debug('created');
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
    return ReS(res, req.transition.toJSON());
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        const transition = req.transition;
        const model = await transition.update(req.body);
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
        let transitions = await Transition.findAll();
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
