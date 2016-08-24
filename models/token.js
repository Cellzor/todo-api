/**
 * Created by Christian on 2016-08-23.
 */
var cryptojs = require('crypto-js');

module.exports = function (sequelize, dataTypes) {
    return sequelize.define('token', {
        token: {
            type: dataTypes.VIRTUAL,
            allowNull: false,
            validation: {
                len: [1]
            },
            set: function (value) {
                var hash = cryptojs.MD5(value).toString();

                this.setDataValue('token', value); //when you override set, you still have to set it
                this.setDataValue('tokenHash', hash);

            }
        },
        tokenHash: dataTypes.STRING
    });

};