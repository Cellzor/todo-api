/**
 * Created by Christian on 2016-08-20.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

//setup middleware
app.use(bodyParser.json()); //parse body to JSON

app.get('/', function(req, res){
   res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res){
    var query = req.query;
    var where = {userId: req.user.get('id')};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);
    }).catch(function (e) {
        res.status(500).json(e);
    });
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id, 10);
    db.todo.findOne({
        where: {
            userId: req.user.get('id'),
            id: todoId
        }
    }).then(function (todo) {
        if (!!todo) { //converts a non-boolean to an inverted boolean, then invert it again.
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }).catch(function (e) {
        res.status(500).send();
    });
});

app.post('/todos', middleware.requireAuthentication, function(req, res){
    var body = _.pick(req.body, 'description', 'completed');    //middleware parsed body to JSON before coming here

    db.todo.create(body).then(function(todo){
        // res.json(todo.toJSON());
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {   //middleware modified the todo object since above declaration, hence reload
            res.json(todo.toJSON());
        });
    }).catch(function(e){
        res.status(404).json(e);
    });
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (deletedRows) {
        if (deletedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({
                error: "No todo with id"
            });
        }
    }).catch(function (e) {
        res.status(500).send();
    });
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')){
        attributes.completed = body.completed;
    }
    if (body.hasOwnProperty('description')){
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (!!todo) {
            todo.update(attributes).then(function () {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);    //executes on locked db
            });
        } else {
            res.status(404).send();
        }
    }).catch(function (e) {
        res.status(500).send();
    });
});

app.post('/users', function(req, res){
     var attributes = _.pick(req.body, 'email', 'password');
    db.user.create(attributes).then(function(user){
        if(!!user){
            res.json(user.toPublicJSON());
        }
    }, function(e){
        res.status(400).json({
            error: "User couldn't be created."
        })
    }).catch(function (e) {
        res.status(500).json({
            error: "Unable to handle your request, due to bad data."
        });
    });
});

app.post('/users/login', function(req, res){
    var attributes = _.pick(req.body, 'email', 'password');

    db.user.authenticate(attributes).then(function(user){
        var token = user.generateToken('authentication');

        if(!!token){
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }

    }, function (){
        res.status(401).send();
    });
});

db.sequelize.sync().then(function (){
    app.listen(PORT, function(){
        console.log('Express listening on port: '+PORT+"!");
    });
});

