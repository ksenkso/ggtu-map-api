const BuildingController = require('../controllers/building.controller');
const {Building} = require('../models');
const {auth, checkAccess, querying} = require('../middleware');
const checkBuildingPermissions = checkAccess({
    modelClass: Building,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию о зданиях',
    modelName: 'building',
    notFoundMessage: 'Корпус не найден.'
});
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.get('/buildings', querying.enableRelations, querying.enableLimits, BuildingController.getAll);                                                                                           // C
    router.post('/buildings', querying.enableRelations, querying.enableLimits, auth, BuildingController.create);                                                                                           // C
    router.get('/buildings/:id', querying.enableRelations, querying.enableLimits, auth, checkBuildingPermissions, BuildingController.get);                                            // R
    router.get('/buildings/:id/locations', querying.enableRelations, querying.enableLimits, auth, checkBuildingPermissions, BuildingController.getAllForBuilding);                                            // R
    router.patch('/buildings/:id', querying.enableRelations, querying.enableLimits, auth, checkBuildingPermissions, BuildingController.update);                                            // U
    router.delete('/buildings/:id', querying.enableRelations, querying.enableLimits, auth, checkBuildingPermissions, BuildingController.remove);
};
