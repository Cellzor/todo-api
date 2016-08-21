/**
 * Created by Christian on 2016-08-21.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;   //instance
db.Sequelize = Sequelize;   //Library

module.exports = db;