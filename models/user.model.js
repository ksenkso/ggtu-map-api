'use strict';
const debug = require('debug')('Model:User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config');
const hashPassword = async (password) => {
    if (!password) {
        throw new Error('Password shouldn\'t be an empty string.');
    } else {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
};



module.exports = (sequelize, DataTypes) => {
    /**
     * @class User
     * @extends Sequelize.Model
     */
    const User = sequelize.define('User', {
        login: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.STRING
    });

    User.beforeSave(async (user) => {
        if (user.changed('password')) {
            user.password = hashPassword(user.password);
        }
    });


    /**
     *
     * @param {String} pw
     * @return {Promise<boolean>}
     */
    User.prototype.comparePassword = async function (pw = '') {
        try {
            return await bcrypt.compare(pw, this.password);
        } catch (e) {
            debug(JSON.stringify(e));
            return false;
        }
    };

    User.prototype.generateJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt.expiration);
        this.token = jwt.sign({user_id: this.id}, CONFIG.jwt.encryption, {expiresIn: expiration_time});
    };

    User.prototype.getClean = function () {
        let json = this.toJSON();
        delete json['password'];
        json.token = this.token;
        return json;
    };

    return User;
};
module.exports.hashPassword = hashPassword;
