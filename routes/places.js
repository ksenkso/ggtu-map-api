const PlaceController = require('../controllers/place.controller');
const {auth, querying} = require('../middleware');
const {Place} = require('../models');
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
    router.post('/places', auth, querying.enableRelations, querying.enableLimits, PlaceController.create);                                                                                           // C
    router.get('/places', auth, querying.enableRelations, querying.enableLimits, PlaceController.getAll);                                            // R
    router.get('/places/expanded', auth, querying.enableRelations, querying.enableLimits, PlaceController.getExpanded);                                            // R
    router.get('/places/:id', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), PlaceController.get);                                            // R
    router.get('/places/:id/expanded', auth, querying.enableRelations, querying.enableLimits, PlaceController.getExpandedById);                                            // R
    router.patch('/places/:id', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), PlaceController.update);                                            // U
    router.delete('/places/:id', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), PlaceController.remove);
};
