'use strict';
const debug = require('debug')('Model:User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config');



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
            let salt, hash;
            try {
                salt = await bcrypt.genSalt(10);
                hash = await bcrypt.hash(user.password, salt);
                user.password = hash;
            } catch (err) {
                if (!user.password) {
                    throw new Error('Password shouldn\'t be an empty string.');
                }
            }

            user.password = hash;
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
        this.token = jwt.sign(
            { user_id: this.id },
            CONFIG.jwt.encryption,
            { expiresIn: CONFIG.jwt.expiration }
        );
    };

    User.prototype.getClean = function () {
        let json = this.toJSON();
        delete json['password'];
        json.token = this.token;
        return json;
    };

    return User;
};
