/**
 * Created by Christian on 2016-08-23.
 */
module.exports = function (db) {

    return {
        requireAuthentication : function (req, res, next) {
            var token = req.get('Auth'); //pulls token from users header set during login
            db.user.findByToken(token).then(function(user){
                req.user = user;
                next();
            }, function (e) {
                res.status(401).send();
            })
        }
    };

};


//If set to function instead to object, other files can pass in data