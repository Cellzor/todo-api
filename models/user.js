 /**
 * Created by Christian on 2016-08-21.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
 var jwt = require('jsonwebtoken');

module.exports = function (sequelize, dataTypes){
    var user = sequelize.define('user', {
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: dataTypes.STRING
        },
        password_hash: {
            type: dataTypes.STRING
        },
        password: {
            type: dataTypes.VIRTUAL,    //Virtual is never getting stored in the db
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value){
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options){
                if(typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(attributes){
                return new Promise(function(resolve, reject){
                    if(typeof attributes.email === 'string' && typeof attributes.password === 'string'){
                        user.findOne({
                            where: {
                                email: attributes.email
                            }
                        }).then(function(user){
                            if(!!user && bcrypt.compareSync(attributes.password, user.get('password_hash'))){
                                return resolve(user);
                            } else {
                                return reject();
                            }
                        }, function(e){
                            reject();
                        }).catch(function(e){
                            reject();
                        });
                    } else {
                        reject();
                    }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            },
            generateToken: function (type){
                if(!_.isString(type)) {
                    return undefined;
                }

                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty098');

                    return token;
                } catch (e) {
                    return undefined;
                }
            }
        }
    });
    return user;
};