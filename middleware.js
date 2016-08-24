/**
 * Created by Christian on 2016-08-23.
 */
var cryptojs = require('crypto-js');
module.exports = function (db) {

    return {
        requireAuthentication : function (req, res, next) {
            var token = req.get('Auth') || ''; //pulls token from users header set during login

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function (tokenInstance) {
                if(!tokenInstance){
                    throw new Error();  //causes catch to respond here
                }
                req.token = tokenInstance;
                return db.user.findByToken(token);
            }).then(function (user) {
                req.user = user;
                next();
            }).catch(function (e) {
                res.status(401).send();
            });
        }
    };

};


//If set to function instead to object, other files can pass in data