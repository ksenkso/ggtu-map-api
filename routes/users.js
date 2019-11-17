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
    router.post('/users', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), UserController.create);
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.get);
    router.patch('/users', auth, querying.enableRelations, querying.enableLimits, UserController.update);
    router.delete('/users', auth, querying.enableRelations, querying.enableLimits, access.createFilter(), UserController.remove);
    router.get('/users/me', auth, querying.enableRelations, querying.enableLimits, UserController.me);
    router.get('/users/tokenInfo', auth, querying.enableRelations, querying.enableLimits, UserController.tokenInfo);
};
