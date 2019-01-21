const debug = require('debug')('App:Controller:Place');
const {ReS} = require('../services/util.service');
const {Place, PlaceProperties, GymProps, WCProps, CabinetProps} = require('../models');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    const {LocationId, number, name, type, container} = req.body;
    const errors = [];
    if (!LocationId) {
        errors.push(new Error('Место не привязано к локации.'));
    }
    if (!container) {
        errors.push(new Error('Место не привязано к области карты.'));
    }
    if (!errors.length) {
        try {
            /**
             * @type Place
             */
            const place = await Place.create({LocationId, number, name, type, container});
            const keys = Object.keys(req.body.properties);
            if (keys.length) {
                const rows = keys.map(key => {

                    return {
                        name: key,
                        value: req.body.properties[key],
                        type
                    };
                });
                await PlaceProperties.bulkCreate(rows);
            }
            const output = place.toJSON();
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
    let place = req.place;
    return ReS(res, place.toJSON());
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        /**
         *
         * There are three variants of how the place can be updated:
         * 1. Update only place attributes;
         * 2. Update only place properties;
         * 3. Update both attributes and properties.
         *
         * If there are any attributes to update they should be updated first.
         * If there was a change in place's type, it's properties should be reset corresponding to the new type. In this case
         * if new properties are defined in the request body they should be used as the initial values for new property row.
         * If there are no place attributes to update check if we should update properties.
         * If there are any properties to update they should be updated after the place record is updated.
         *
         * Send the updated record to the client.
         */
        const prevType = req.place.type;
        let {props} = req.body;
        delete req.body.props;
        let place = await req.place.update(req.body);
        if (prevType && prevType !== req.place.type) {
            props = props ? Object.assign(props, {PlaceId: req.place.id}) : {PlaceId: req.place.id};
            await Place.getPropsClass(prevType).destroy({where: {PlaceId: req.place.id}});
            await Place.getPropsClass(req.place.type).create(props);
        } else {
            if (props) {
                props.PlaceId = req.place.id;
                const propsClass = Place.getPropsClass(req.place.type);
                debug('Got props class - ' + (propsClass ? propsClass.name : 'undefined'));
                const [newProps] = await propsClass
                    .findOrCreate({where: {PlaceId: req.place.id}});
                debug('Got record: ' + newProps.toJSON());
                place.props = await newProps.update(props);
            }
        }
        return ReS(res, req.place.toJSON());
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const place = req.place, id = place.id;
    try {
        await Place.getPropsClass(place.type).destroy({where: {PlaceId: id}});
        await place.destroy();
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
    if (!map) {
        errors.push(new Error('Загрузите файл.'));
    }
    if (file.mimetype !== 'image/svg') {
        errors.push(new Error('Файл карты должен быть в формате SVG.'))
    }
    if (!errors.length) {
        const place = req.place;
        const name = `${place.BuildingId}-${place.id}.svg`;
        const err = await file.mv('maps/' + name);
        if (err) {
            next(err);
        } else {
            return ReS(res, place, 200);
        }
    } else {
        return next(errors);
    }
};
module.exports.upload = upload;

/**
 *
 * @param {Number} [id]
 * @return {Array<Sequelize.Model>}
 */
async function getPlacesExpanded(id) {
    const config = {
        include: [{
            model: GymProps,
            attributes: ['hasTrainers']
        }, {
            model: CabinetProps,
            attributes: ['hasProjector', 'isComputerClass', 'isBig']
        }, {
            model: WCProps,
            attributes: ['sex']
        }],
        attributes: ['name', 'type', 'container']
    };
    let places;
    if (id) {
        places = [await Place.findById(id, config)];
        debug(`Places count: ${places.length}`);
    } else {
        places = await Place.findAll(config);
    }
    if (places) {
        places = places.map(place => {
            const data = place.toJSON();
            switch (data.type) {
                case 'cabinet': {
                    data.props = data.CabinetProps[0];
                    break;
                }
                case 'wc': {
                    data.props = data.WCProps[0];
                    break;
                }
                case 'gym': {
                    data.props = data.GymProps[0];
                    break;
                }
            }
            delete data.WCProps;
            delete data.CabinetProps;
            delete data.GymProps;
            return data;
        });
        return places;
    } else {
        return [];
    }
}

const getExpanded = async function (req, res, next) {
    try {
        const places = await getPlacesExpanded();
        if (places.length) {
            return ReS(res, places, 200);
        } else {
            return ReS(res, [], 404);
        }
    } catch (e) {
        next(e);
    }
};
module.exports.getExpanded = getExpanded;

const getAll = async function(req, res, next) {
    try {
        let places = await Place.findAll({
            attributes: ['name', 'type', 'container']
        });
        if (places) {
            return ReS(res, places, 200);
        } else {
            return ReS(res, [], 404);
        }
    } catch (e) {
        next(e);
    }
};
module.exports.getAll = getAll;

const getExpandedById = async function(req, res, next) {
    try {
        const place = await getPlacesExpanded(req.params.id);
        if (place) {
            return ReS(res, place, 200);
        } else {
            return ReS(res, [], 404);
        }
    } catch (e) {
        next(e);
    }
};
module.exports.getExpandedById = getExpandedById;
