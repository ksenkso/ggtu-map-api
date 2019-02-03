const TransitionsController = require('../controllers/transitions.controller');
const {auth, querying} = require('../middleware');
const {Transition} = require('../models');
const AccessFilter = require('../middleware/AccessFilter');
class TransitionsFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: Transition,
            errorMessage: 'Только администратор может изменять информацию о переходах',
            modelName: 'transition',
            notFoundMessage: 'Переход не найден.'
        });
    }

    check({user}) {
        return user.role === 'root';
    }
}
const access = new TransitionsFilter();

module.exports = (router) => {
    router.post(
        '/transitions',
        auth,
        TransitionsController.create
    );
    router.get(
        '/transitions',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        TransitionsController.getAll,
    );
    router.get(
        '/transitions/:id',
        auth,
        querying.enableRelations,
        querying.enableLimits,
        access.createFilter(),
        TransitionsController.get
    );
    router.patch(
        '/transitions/:id',
        auth,
        querying.enableRelations,
        access.createFilter(),
        TransitionsController.update
    );
    router.delete('/transitions/:id',
        auth,
        querying.enableRelations,
        access.createFilter(),
        TransitionsController.remove
    );

    router.post(
        '/transitions/:id',
        auth,
        access.createFilter(),
        TransitionsController.addView
    )
};
