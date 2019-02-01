const passport = require('passport');
require('./passport')(passport);

module.exports = {
    auth: passport.authenticate('jwt', {session: false}),
    querying: require('./querying'),
    AccessFilter: require('./AccessFilter')
};
