/**
 * @typedef {{x: number, y: number, z?: number}} Point3D
 */
/**
 * @typedef {{position: Point3D, siblings: number[], ObjectId: number}} AdjacencyNode
 */
/**
 * @typedef {AdjacencyNode[]} AdjacencyList
 *
 */

const fs = require('fs');
const path = require('path');
const debug = require('debug')('App:Locations');
const uuidv4 = require('uuid/v4');
const {ReS} = require('../services/util.service');
const {Location, Place, Building, TransitionView, PathVertex, MapObject, PathEdge} = require('../models');
const {Op} = require('sequelize');

const MAPS_PATH = process.env.MAPS_PATH || path.resolve(__dirname, '../maps/');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {name, map, BuildingId, floor} = req.body;
    const errors = [];
    if (!name) {
        errors.push(new Error('Укажите название локации.'));
    }
    if (!errors.length) {
        try {
            const location = await Location.create({name, map, BuildingId, floor});
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

const getAll = async function (req, res, next) {
    try {
        const config = Object.assign({}, req.queryConfig);
        config.include = config.include || [{
            model: Building,
        }];
        let locations = await Location.findAll(config);
        locations = locations ? locations.map(l => l.toJSON()) : [];
        return ReS(res, locations, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;

const getPlaces = async function (req, res, next) {
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

const getRoot = async function (req, res, next) {
    try {
        const location = await Location.findOne({where: {BuildingId: null}});
        if (location) {
            return ReS(res, location.toJSON());
        } else {
            const error = new Error('Корневая локация не найдена');
            error.status = 404;
            next(error);}
    } catch (e) {
        next(e);
    }
};
module.exports.getRoot = getRoot;

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

const upload = async function (req, res, next) {
    const errors = [];
    if (!req.files) {
        errors.push(new Error('Загрузите файл.'));
        return next(errors);
    }
    const file = req.files.map;
    if (!file) {
        errors.push(new Error('Загрузите файл.'));
    } else if (file.mimetype !== 'image/svg+xml') {
        errors.push(new Error('Файл карты должен быть в формате SVG, получено: ' + file.mimetype));
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

const getObjects = async function (req, res, next) {
    const LocationId = req.params.id;
    const location = req.location;
    try {
        const queries = [
            Place.findAll({where: {LocationId}, include: [{association: 'Props'}, {association: 'MapObject'}]}),
            TransitionView.findAll({where: {LocationId}, include: [{association: 'Transition'}, {association: 'MapObject'}]})
        ];
        if (location.BuildingId === null) {
            queries.push(Building.findAll());
        }
        const [places, transitionViews, buildings = []] = await Promise.all(queries);
        const output = {
            places,
            transitionViews,
            buildings
        };
        return res.json(output);

    } catch (e) {
        return next(e);
    }
};
module.exports.getObjects = getObjects;

const getNavigationPath = async function (req, res, next) {
    const LocationId = req.params.id;
    try {
        const expandedVertices = await PathVertex.findAll({
            where: {LocationId},
            include: {
                association: PathVertex.Object,
                include: [{
                    association: MapObject.Place,
                    attributes: ['name', 'type', 'container']
                }, {association: MapObject.TransitionView, attributes: ['container', 'TransitionId']}]
            },
            attributes: ['id', 'x', 'y', 'z']
        });
        const ids = expandedVertices.map(v => v.id);
        const edges = await PathEdge.findAll({
            where: {
                [Op.or]: [
                    {StartId: {[Op.in]: ids}},
                    {EndId: {[Op.in]: ids}},
                ]
            },
        }).map(e => e.toJSON());
        const vertices = expandedVertices.map(v => {
            const entry = v.toJSON();
            if (entry.Object.Place) {
                entry.type = 'Place';
                entry.Place = entry.Object.Place;
                delete entry.Object.TransitionView;
            }
            if (entry.Object.TransitionView) {
                entry.type = 'TransitionView';
                entry.TransitionView = entry.Object.TransitionView;
                delete entry.Object.Place;
            }
            return entry;
        });
        const list = mergeToAdjacencyList(vertices, edges);
        res.json(list);
    } catch (e) {
        next(e);
    }
};
module.exports.getNavigationPath = getNavigationPath;

const updatePath = async function (req, res, next) {
    const LocationId = +req.params.id;
    /**
     * @type AdjacencyList
     */
    const graph = req.body;
    if (graph.length) {
        try {
            //     Remove previous graph from DB
            await PathVertex.destroy({where: {LocationId}});
            const vertices = await PathVertex.bulkCreate(graph.map(node => ({
                x: node.position.x,
                y: node.position.y,
                z: node.position.z,
                LocationId,
                ObjectId: node.ObjectId,
            })));
            const edgesToCreate = [];
            vertices.forEach((vertex, index) => {
                graph[index].siblings.forEach(siblingIndex => {
                    edgesToCreate.push({StartId: vertex.id, EndId: vertices[siblingIndex].id});
                });
            });
            const edges = await PathEdge.bulkCreate(edgesToCreate);
            return res.json(mergeToAdjacencyList(vertices, edges));
        } catch (e) {
            next(e);
        }
    } else {
        const error = new Error('Граф путей не может быть пустым');
        error.status = 400;
        next(error);
    }


};
module.exports.updatePath = updatePath;

/**
 *
 * @param vertices
 * @param edges
 * @return {Array}
 */
function mergeToAdjacencyList(vertices, edges) {
    const groupedEdges = {};
    edges.forEach(edge => {
        if (groupedEdges[edge.StartId]) {
            groupedEdges[edge.StartId].push(edge);
        } else {
            groupedEdges[edge.StartId] = [edge];
        }
    });
    const list = [];
    for (let i = 0; i < vertices.length; i++) {
        const id = vertices[i].id;
        const entry = {
            position: {x: vertices[i].x, y: vertices[i].y, z: vertices[i].z},
            Object: vertices[i][vertices[i].type],
            type: vertices[i].type
        };
        if (groupedEdges[id]) {
            entry.edges = groupedEdges[id].map(edge => vertices.findIndex(v => v.id === edge.EndId));
        } else {
            entry.edges = [];
        }
        list.push(entry);
    }
    return list;
}
