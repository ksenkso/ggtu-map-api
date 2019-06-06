const {auth} = require('../middleware');
const SearchController = require('../controllers/search.controller');
module.exports = (router) => {
    router.get('/search', auth, SearchController.find);
    router.get('/search/path', auth, SearchController.findPath);
    router.get('/search/path/byId', SearchController.findPathByIds);
};
