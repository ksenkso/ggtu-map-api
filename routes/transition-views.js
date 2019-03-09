const ViewsController = require('../controllers/transition-views.controller');
const {auth} = require('../middleware');
const {TransitionView} = require('../models');
const AccessFilter = require('../middleware/AccessFilter');
class ViewsFilter extends AccessFilter {
    constructor() {
        super({
            modelClass: TransitionView,
            errorMessage: 'Только администратор может изменять информацию о переходах',
            modelName: 'view',
            notFoundMessage: 'Переход не найден.',
            check({user}) {
                return user.role === 'root';
            }
        });
    }


}
const access = new ViewsFilter();

module.exports = (router) => {
    router.post(
        '/transition-views',
        auth,
        access.createFilter({modelClass: null}),
        ViewsController.create
    );
    router.get(
        '/transition-views/:id',
        auth,
        access.createFilter({
            check() {
                return true
            }
        }),
        ViewsController.get
    );
    router.patch(
        '/transition-views/:id',
        auth,
        access.createFilter(),
        ViewsController.update
    );
    router.delete(
        '/transition-views/:id',
        auth,
        access.createFilter(),
        ViewsController.remove
    )
};
