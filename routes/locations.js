const LocationController = require('../controllers/location.controller');
const fileUpload = require('express-fileupload');
const {auth, checkAccess, querying} = require('../middleware');
const {Location} = require('../models');

const checkLocationPermissions = checkAccess({
    modelClass: Location,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию об этажах',
    modelName: 'location',
    notFoundMessage: 'Этаж не найден.'
});
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.post('/locations', auth, LocationController.create);                                                                                           // C
    router.get('/locations', auth, querying.enableRelations, querying.enableLimits, LocationController.getAll);                                                                                           // C
    router.get('/locations/:id', auth, querying.enableRelations, querying.enableLimits, checkLocationPermissions, LocationController.get);                                            // R
    router.get('/locations/:id/places', auth, checkLocationPermissions, LocationController.getPlaces);                                            // R
    router.patch('/locations/:id', auth, checkLocationPermissions, LocationController.update);                                            // U
    router.patch('/locations/:id/upload', auth, checkLocationPermissions, fileUpload(), LocationController.upload);                                            // U
    router.delete('/locations/:id', auth, checkLocationPermissions, LocationController.remove);
};
