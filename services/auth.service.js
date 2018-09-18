const {OAuth2Client} = require('google-auth-library');
const {User} = require('../models');
const validator = require('validator');
const debug = require('debug')('Auth');

const CLIENT_ID = '777688038969-dgf86lie7v6pkq4qr3p5rscd1atfu9cg.apps.googleusercontent.com';

/**
 *
 * @param {String} login
 * @param {String} password
 * @return {Promise<Model>}
 * @throws {Error}
 */
const createUser = async (login, password) => {
    return await User.create({login, password});
};
module.exports.createUser = createUser;

/**
 *
 * @param token
 * @return {Promise<TokenPayload | undefined>}
 */
async function checkAccessToken(token) {
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return ticket.getPayload();
}

/**
 *
 * @param email
 * @param password
 * @return {Promise<Model>}
 * @throws {Error}
 */
const authUser = async function ({login, password}) {
    const user = await User.findOne({where: {login}});
    if (user) {
        if (user.comparePassword(password)) {
            return user;
        } else {
            throw new Error('Неверный пароль.');
        }
    } else {
        throw new Error('Нет пользователя с таким логином.');
    }
};
module.exports.authUser = authUser;

