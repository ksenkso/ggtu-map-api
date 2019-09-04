const jwt = require("jsonwebtoken");
const authService = require('../services/auth.service');
const {ReS, handleError} = require('../services/util.service');
const pe = require('parse-error');
const {User} = require('../models');
const CONFIG = require('../config');
// const debug = require('debug')('Auth');
/**
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<Model>}
 */
const create = async function (req, res, next) {
    let {login, password, role} = req.body;
    const errors = [];
    if (!login) {
        errors.push(new Error('Please enter login'));
    }
    if (!password) {
        errors.push(new Error('Please enter password'));
    }
    if (
        role && (req.user || req.user.role !== 'root') ||
        !role
    ) {
        role = 'consumer';
    }
    if (!errors.length) {
        try {
            const user = await authService.createUser(login, password, role);
            user.generateJWT();
            const userInfo = user.getClean();
            return ReS(res, userInfo, 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }

};
module.exports.create = create;

const tokenInfo = async function (req, res, next) {
    const token = req.get('Authorization').substring(7);
    if (token) {
        try {
            const info = await new Promise((resolve, reject) => {
                jwt.verify(token, CONFIG.jwt.encryption, (error, decoded) => {
                    if (decoded) {
                        resolve(decoded);
                    } else {
                        console.log(error);
                        reject(error);
                    }
                });
            });
            if (info) {
                info.text = token;
                return ReS(res, info, 200);
            } else {
                return next(new Error('wtf'))
            }
        } catch (e) {
            return next(e);
        }
    } else {
        return next()

    }

};
module.exports.tokenInfo = tokenInfo;

const register = async function (req, res, next) {
    const {login, password} = req.body;
    const role = 'consumer';
    const errors = [];
    if (!login) {
        errors.push(new Error('Please enter your login'));
    }
    if (!password) {
        errors.push(new Error('Please enter your password'));
    }
    if (!errors.length) {
        try {
            const user = await authService.createUser(login, password, role);
            user.generateJWT();
            const userInfo = user.getClean();
            return ReS(res, userInfo, 201);
        } catch (e) {
            next(e);
        }
    } else {
        return next(errors);
    }
};
module.exports.register = register;

const get = async function (req, res) {
    let user = req.user;
    return ReS(res, {user: user.getClean()});
};
module.exports.get = get;

const update = async function (req, res, next) {
    try {
        await req.user.update(req.body);
        return ReS(res, {user: req.user.getClean()});
    } catch (e) {
        next(e);
    }
};
module.exports.update = update;

const remove = async function (req, res, next) {
    const user = req.user, id = user.id;
    try {
        await user.destroy();
        return ReS(res, {id}, 200);
    } catch (e) {
        next(e);
    }
};
module.exports.remove = remove;


const login = async function (req, res, next) {
    try {
        const user = await authService.authUser(req.body);
        user.generateJWT();
        return ReS(res, user.getClean());
    } catch (e) {
        const err = pe(e);
        err.status = 401;
        handleError(err, next);
    }
};
module.exports.login = login;


const checkAuth = async function (req, res, next) {
    /**
     * 1. Check if token is expired
     * 2. Check if token is signed properly
     * 3. Check if token contains valid user id
     */
    try {
        const decoded = jwt.verify(req.query.token, CONFIG.jwt.encryption);
        if (decoded) {
            const ok = !!await User.count({where: {id: decoded.user_id}});
            console.log(ok);
            if (!ok) {
                const error = new Error('Такого пользователя не существует.');
                error.status = 401;
                handleError(error, next);
            } else {
                ReS(res, {ok});
            }
        }
    } catch (e) {
        const err = pe(e);
        err.status = 401;
        handleError(err, next);
    }
};
module.exports.checkAuth = checkAuth;

const me = async function (req, res) {
    return ReS(res, {user: req.user.getClean()});
};
module.exports.me = me;
