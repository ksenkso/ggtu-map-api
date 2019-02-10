const PlaceController = require('../controllers/place.controller');
const {auth, querying} = require('../middleware');
const {Place, MapObject} = require('../models');
const AccessFilter = require('../middleware/AccessFilter');
class PlacesFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: Place,
            errorMessage: 'Только администратор может изменять информацию о местах',
            modelName: 'place',
            notFoundMessage: 'Место не найдено.'
        });
    }

    check({user}) {
        return user.role === 'root';
    }
}
const access = new PlacesFilter();
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.post('/places',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        PlaceController.create,
    );
    router.get('/places',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        PlaceController.getAll,
    );
    router.get('/places/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({
            include: [{
                association: 'Props',
                attributes: ['name','value']
            }, {
                model: MapObject,
                attributes: ['id', 'PlaceId']
            }]
        }),
        PlaceController.get,
    );
    router.patch('/places/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter(),
        PlaceController.update,
    );
    router.delete('/places/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter(),
        PlaceController.remove,
    );
};
