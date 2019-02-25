const {TransitionView, PathVertex, MapObject, PathEdge} = require('../models');
const {Op} = require('sequelize');

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
        res.json(updated.toJSON());
    } catch (e) {
        return next(e);
    }
};
module.exports.update = update;

const create = async function(req, res, next) {
    try {
        const {TransitionId, container, LocationId, coords} = req.body;
        const created = await TransitionView.create({TransitionId, container, LocationId});
        // Create vertex for the transition view
        const ObjectId = await MapObject.findOne({where: {TransitionViewId: created.id}}).id;
        const vertex = await PathVertex.create({x: coords.x, y: coords.y, z: coords.z, LocationId, ObjectId});
        // Connect created vertex with other vertices with the same transition id
        const views = await TransitionView.findAll({where: {TransitionId}, include: [{model: MapObject}]});
        const objectIds = views.map(view => view.MapObject && view.MapObject.id).filter(v => !!v && v !== ObjectId);
        const vertices = await PathVertex.findAll({
            where: {
                ObjectId: {
                    [Op.in]: objectIds
                }
            }
        });
        const edgesToCreate = vertices
            .map(v => ({
                StartId: v.id,
                EndId: vertex.id
            }))
            .concat(vertices.map(v => ({
                EndId: v.id,
                StartId: vertex.id
            })));
        await PathEdge.bulkCreate(edgesToCreate);
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
