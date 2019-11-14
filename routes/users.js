const UserController = require('../controllers/user.controller');
const {auth, querying} = require('../middleware');
const {User} = require('../models');
const AccessFilter = require('../middleware/AccessFilter');
class UsersFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: User,
            errorMessage: 'Только администратор может добавлять новых пользователей с назаначением роли',
            modelName: 'userModel',
            notFoundMessage: 'Пользователь не найден',
            check({user}) {
                return user.role === 'root';
            }
        });
    }


}
const access = new UsersFilter();
/**
 *
 * @param router
 */
module.exports = (router) => {
    router.post('/login', UserController.login);
    router.get('/auth', UserController.checkAuth);
    router.post('/register', UserController.create);
    // Uncomment next line to allow user creation for unauthorized users
    //router.post('/users', querying.enableRelations, querying.enableLimits, UserController.create);
    // Uncomment next line to allow user creation only for root users
    router.post('/users', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), UserController.create);                                                                                           // C
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.get);                                            // R
    router.patch('/users', auth, querying.enableRelations, querying.enableLimits, UserController.update);                                            // U
    router.delete('/users', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), UserController.remove);                                         // D
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.me);                                             // R                                                                                   // C
    router.get('/users/tokenInfo', auth, querying.enableRelations, querying.enableLimits, UserController.tokenInfo);                                             // R                                                                                   // C
};
