const {TransitionView} = require('../models');

const remove = async function(req, res, next) {
    try {
        const id = req.params.id;
        await req.view.destroy();
        return res.json({id});
    } catch (e) {
        return next(e);
    }
};
module.exports.remove = remove;

const update = async function(req, res, next) {
    try {
        const updated = await req.view.update(req.body);
        res.json(updated.toJSON())
    } catch (e) {
        return next(e);
    }
};
module.exports.update = update;

const create = async function(req, res, next) {
    try {
        const {TransitionId, container, LocationId} = req.body;
        const created = await TransitionView.create({TransitionId, container, LocationId});
        return res.status(201).json(created.toJSON());
    } catch (e) {
        return next(e);
    }
};
module.exports.create = create;

const get = async function(req, res, next) {
    try {
        return res.json(req.view.toJSON());
    } catch (e) {
        return next(e);
    }
};
module.exports.get = get;
