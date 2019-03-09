const LocationController = require('../controllers/location.controller');
const fileUpload = require('express-fileupload');
const {
    auth,
    querying
} = require('../middleware');
const AccessFilter = require('../middleware/AccessFilter');
const {Location} = require('../models');

class LocationsFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: Location,
            errorMessage: 'Только администратор может изменять информацию об этажах',
            modelName: 'location',
            notFoundMessage: 'Локация не найдена',
            check({user}) {
                return user.role === 'root';
            }
        });
    }


}

const access = new LocationsFilter();

/**
 *
 * @param router
 */
module.exports = (router) => {
    router.post(
        '/locations',
        auth,
        LocationController.create
    );
    router.get(
        '/locations',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        LocationController.getAll
    );
    router.get(
        '/locations/root',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        LocationController.getRoot
    );
    router.get(
        '/locations/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({
            check() {
                return true
            }
        }),
        LocationController.get);
    router.get(
        '/locations/:id/places',
        auth,
        querying.enableLimits,
        querying.enableWhere,
        access.createFilter({
            check() {
                return true
            }
        }),
        LocationController.getPlaces
    );
    router.get(
        '/locations/:id/objects',
        auth,
        querying.enableLimits,
        querying.enableWhere,
        access.createFilter({
            check() {
                return true
            }
        }),
        LocationController.getObjects
    );
    router.get(
        '/locations/:id/paths',
        auth,
        querying.enableLimits,
        querying.enableWhere,
        access.createFilter({
            check() {
                return true
            }
        }),
        LocationController.getNavigationPath
    );
    router.put(
        '/locations/:id/paths',
        auth,
        querying.enableLimits,
        querying.enableWhere,
        access.createFilter(),
        LocationController.updatePath
    );
    router.patch(
        '/locations/:id',
        auth,
        access.createFilter(),
        LocationController.update
    );
    router.patch(
        '/locations/:id/upload',
        auth,
        access.createFilter(),
        fileUpload(),
        LocationController.upload
    );
    router.delete(
        '/locations/:id',
        auth,
        access.createFilter(),
        LocationController.remove
    );
};
