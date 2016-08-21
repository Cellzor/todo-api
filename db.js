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
db.sequelize = sequelize;   //instance
db.Sequelize = Sequelize;   //Library

module.exports = db;