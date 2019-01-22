const UserController = require('../controllers/user.controller');
const {auth, checkAccess, querying} = require('../middleware');
const {User} = require('../models');
const checkUserPermissions = checkAccess({
    modelClass: User,
    hasPermission({user}) {
        return user.role === 'root'
    },
    errorMessage: 'Только администратор может добавлять новых пользователей с назаначением роли',
    modelName: 'userModel',
    notFoundMessage: 'Пользователь не найден'
});
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.post('/login', UserController.login);
    router.get('/auth', UserController.checkAuth);
    router.post('/register', UserController.create);

    router.post('/users', auth, querying.enableRelations, querying.enableLimits, checkUserPermissions, UserController.create);                                                                                           // C
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.get);                                            // R
    router.patch('/users', auth, querying.enableRelations, querying.enableLimits, UserController.update);                                            // U
    router.delete('/users', auth, querying.enableRelations, querying.enableLimits, UserController.remove);                                         // D
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.me);                                             // R                                                                                   // C
    router.get('/users/tokenInfo', auth, querying.enableRelations, querying.enableLimits, UserController.tokenInfo);                                             // R                                                                                   // C
};
