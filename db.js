/**
 * Created by Christian on 2016-08-21.
 */
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if(env === 'production') {
    //only run on heroku
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    });
} else {
    //in dev env
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}


var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;   //instance
db.Sequelize = Sequelize;   //Library

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;