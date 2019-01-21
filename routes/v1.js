const express = require('express');
const router = express.Router();
const passport = require('passport');
const path = require('path');
const fileUpload = require('express-fileupload');

const UserController = require('../controllers/user.controller');
const BuildingController = require('../controllers/building.controller');
const LocationController = require('../controllers/location.controller');
const PlaceController = require('../controllers/place.controller');


const {Building, Location, Place, User} = require('../models');

// Permissions section
const checkAccess = require('./../middleware/checkAccess');
const checkUserPermissions = checkAccess({
    modelClass: User,
    hasPermission({user}) {
        return user.role === 'root'
    },
    errorMessage: 'Только администратор может добавлять новых пользователей с назаначением роли',
    modelName: 'userModel',
    notFoundMessage: 'Пользователь не найден'
});
const checkBuildingPermissions = checkAccess({
    modelClass: Building,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию о корпусах',
    modelName: 'building',
    notFoundMessage: 'Корпус не найден.'
});
const checkLocationPermissions = checkAccess({
    modelClass: Location,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию об этажах',
    modelName: 'location',
    notFoundMessage: 'Этаж не найден.'
});

const checkPlacePermissions = checkAccess({
    modelClass: Place,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию о местах',
    modelName: 'place',
    notFoundMessage: 'Место не найдено.'
});


require('./../middleware/passport')(passport);
/* GET home page. */
router.get('/', function (req, res) {
    res.json({success: true, message: "Bookmarks API", data: {"version_number": "v1.0.0"}})
});

router.post('/login', UserController.login);
router.get('/auth', UserController.checkAuth);
router.post('/register', UserController.create);

router.post('/users', passport.authenticate('jwt', {session: false}), checkUserPermissions, UserController.create);                                                                                           // C
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.get);                                            // R
router.patch('/users', passport.authenticate('jwt', {session: false}), UserController.update);                                            // U
router.delete('/users', passport.authenticate('jwt', {session: false}), UserController.remove);                                         // D
router.get('/users/me', passport.authenticate('jwt', {session: false}), UserController.me);                                             // R                                                                                   // C
router.get('/users/tokenInfo', passport.authenticate('jwt', {session: false}), UserController.tokenInfo);                                             // R                                                                                   // C


// Buildings
router.get('/buildings', BuildingController.getAll);                                                                                           // C
router.post('/buildings', passport.authenticate('jwt', {session: false}), BuildingController.create);                                                                                           // C
router.get('/buildings/:id', passport.authenticate('jwt', {session: false}), checkBuildingPermissions, BuildingController.get);                                            // R
router.get('/buildings/:id/locations', passport.authenticate('jwt', {session: false}), checkBuildingPermissions, BuildingController.getAllForBuilding);                                            // R
router.patch('/buildings/:id', passport.authenticate('jwt', {session: false}), checkBuildingPermissions, BuildingController.update);                                            // U
router.delete('/buildings/:id', passport.authenticate('jwt', {session: false}), checkBuildingPermissions, BuildingController.remove);


// Locations
router.post('/locations', passport.authenticate('jwt', {session: false}), LocationController.create);                                                                                           // C
router.get('/locations', passport.authenticate('jwt', {session: false}), LocationController.getAll);                                                                                           // C
router.get('/locations/:id', passport.authenticate('jwt', {session: false}), checkLocationPermissions, LocationController.get);                                            // R
router.get('/locations/:id/places', passport.authenticate('jwt', {session: false}), checkLocationPermissions, LocationController.getPlaces);                                            // R
router.patch('/locations/:id', passport.authenticate('jwt', {session: false}), checkLocationPermissions, LocationController.update);                                            // U
router.patch('/locations/:id/upload', passport.authenticate('jwt', {session: false}), checkLocationPermissions, fileUpload(), LocationController.upload);                                            // U
router.delete('/locations/:id', passport.authenticate('jwt', {session: false}), checkLocationPermissions, LocationController.remove);

// Places
router.post('/places', passport.authenticate('jwt', {session: false}), PlaceController.create);                                                                                           // C
router.get('/places', passport.authenticate('jwt', {session: false}), PlaceController.getAll);                                            // R
router.get('/places/expanded', passport.authenticate('jwt', {session: false}), PlaceController.getExpanded);                                            // R
router.get('/places/:id', passport.authenticate('jwt', {session: false}), checkPlacePermissions, PlaceController.get);                                            // R
router.get('/places/:id/expanded', passport.authenticate('jwt', {session: false}), PlaceController.getExpandedById);                                            // R
router.patch('/places/:id', passport.authenticate('jwt', {session: false}), checkPlacePermissions, PlaceController.update);                                            // U
router.delete('/places/:id', passport.authenticate('jwt', {session: false}), checkPlacePermissions, PlaceController.remove);

//********* API DOCUMENTATION **********
router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
