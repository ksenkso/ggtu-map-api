const BuildingController = require('../controllers/building.controller');
const {Building} = require('../models');
const {auth, querying} = require('../middleware');
const AccessFilter = require('../middleware/AccessFilter');
class BuildingsFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: Building,
            hasPermission({user}) {
                return user.role === 'root';
            },
            errorMessage: 'Только администратор может изменять информацию о зданиях',
            modelName: 'building',
            notFoundMessage: 'Корпус не найден.',
            check({user}) {
                return user.role === 'root';
            }
        });
    }
}

const access = new BuildingsFilter();
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.get('/buildings',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        BuildingController.getAll
    );
    router.post('/buildings',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        BuildingController.create
    );
    router.get('/buildings/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({
            check() {
                return true
            }
        }),
        BuildingController.get
    );
    router.get('/buildings/:id/transitions',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({modelClass: null, check() {return true}}),
        BuildingController.getTransitions
    );
    router.get('/buildings/:id/locations',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({modelClass: null, check() {return true;}}),
        BuildingController.getAllForBuilding
    );
    router.patch('/buildings/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter({
            check() {
                return true
            }
        }),
        BuildingController.update
    );
    router.delete('/buildings/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter(),
        BuildingController.remove
    );
};
