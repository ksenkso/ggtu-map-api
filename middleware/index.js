const passport = require('passport');
require('./passport')(passport);

module.exports = {
    checkAccess: require('./checkAccess'),
    auth: passport.authenticate('jwt', {session: false}),
    querying: require('./querying')
};
