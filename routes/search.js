const {auth} = require('../middleware');
const SearchController = require('../controllers/search.controller');
module.exports = (router) => {
    router.get('/search', auth, SearchController.find)
};
