const jwt = require('jsonwebtoken');
const {User} = require('../models');
const CONFIG = require('../config/config');


/**
 *
 * @param {String} login
 * @param {String} password
 * @param {String} role
 * @return {Promise<Model>}
 * @throws {Error}
 */
const createUser = async (login, password, role) => {
    return await User.create({login, password, role});
};
module.exports.createUser = createUser;

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
        if (await user.comparePassword(password)) {
            return user;
        } else {
            throw new Error('Неверный пароль.');
        }
    } else {
        throw new Error('Нет пользователя с таким логином.');
    }
};
module.exports.authUser = authUser;

/**
 *
 * @param token
 * @return {Promise<boolean>}
 */
const checkToken = async function (token) {
    console.log(token);
    const decoded = jwt.verify(token, CONFIG.jwt_encryption);
    if (decoded) {
        if (decoded.user_id) {
            const user = await User.findOne({where: {id: decoded.user_id}});
            return !!user;
        }
    }
    return false;
};
module.exports.checkToken = checkToken;

