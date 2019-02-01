const debug = require('debug')('App:Controller:Transition');
const {ReS} = require('../services/util.service');
const {Transition, TransitionLinks} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {LocationId, container, links} = req.body;
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
            const transition = await Transition.create({LocationId, container});
            debug('created');
            const output = transition.toJSON();
            output.links = [];
            if (links && links.length) {
                const createdLinks = await TransitionLinks.bulkCreate(links.map(link => ({TransitionId: transition.id, linkedId: link})));
                if (createdLinks && createdLinks.length) {
                    output.links = createdLinks.map(l => l.id);
                }
            }
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
    config.include = config.include ? config.include : [{model: TransitionLinks, attributes: ['linkedId']}];
    const transition = await Transition.findOne(config);
    const output = transition.toJSON();
    if (output.TransitionLinks) {
        output.links = output.TransitionLinks.map(link => link.linkedId);
        delete output.TransitionLinks;
    }
    return ReS(res, output);
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        const transition = req.transition;
        const links = req.body.links;
        delete req.body.links;
        const model = await transition.update(req.body);
        const output = model.toJSON();
        output.links = [];
        if (links && links.length) {
        //     Need to optimize here
            await TransitionLinks.destroy({where: {TransitionId: transition.id}});
            const createdLinks = await TransitionLinks.bulkCreate(links.map(link => ({TransitionId: transition.id, linkedId: link})));
            if (createdLinks) {
                output.links = createdLinks.map(link => link.linkedId);
            }
        }
        return ReS(res, output);
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
        const include = [
            {
                model: TransitionLinks,
                attributes: ['linkedId']
            }
        ];
        const config = req.queryConfig;
        config.include = config.include || include;
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
