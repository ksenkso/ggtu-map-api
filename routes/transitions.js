const TransitionsController = require('../controllers/transitions.controller');
const {auth, checkAccess, querying} = require('../middleware');
const {Transition} = require('../models');
const checkTransitionPermissions = checkAccess({
    modelClass: Transition,
    hasPermission({user}) {
        return user.role === 'root';
    },
    errorMessage: 'Только администратор может изменять информацию о переходах',
    modelName: 'transition',
    notFoundMessage: 'Переход не найден.'
});

module.exports = (router) => {
    router.post('/transitions', auth, TransitionsController.create);
    router.get('/transitions', auth, querying.enableRelations, querying.enableLimits, TransitionsController.getAll);
    router.post('/transitions/:id', auth, TransitionsController.addView);
    router.get('/transitions/:id', auth, querying.enableRelations, querying.enableLimits, checkTransitionPermissions, TransitionsController.get);
    router.patch('/transitions/:id', auth, checkTransitionPermissions, TransitionsController.update);
    router.delete('/transitions/:id', auth, checkTransitionPermissions, TransitionsController.remove);
};
