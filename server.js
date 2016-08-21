/**
 * Created by Christian on 2016-08-20.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

//setup middleware
app.use(bodyParser.json()); //parse body to JSON

app.get('/', function(req, res){
   res.send('Todo API Root');
});

app.get('/todos', function(req, res){
    var query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true'){
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false'){
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0){
        where.description = {
                $like: '%' + query.q + '%'
            };
    }

    db.todo.findAll({where: where}).then(function(todos){
        res.json(todos);
    }).catch(function(e){
        res.status(500).json(e);
    });
});

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function(todo){
        if(!!todo){ //converts a non-boolean to an inverted boolean, then invert it again.
            res.json(todo.toJSON());
        }else{
            res.status(404).send();
        }
    }).catch(function(e){
        res.status(500).send();
    });
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');    //middleware parsed body to JSON before coming here

    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }).catch(function(e){
        res.status(404).json(e);
    });
});

app.delete('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(matchedTodo){
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }else {
        res.status(404).json({"error": "no todo found with that id"});
    }

});

app.put('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if(!matchedTodo){
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    } else if(body.hasOwnProperty('completed')){
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')){
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes); //Object in JS are passed ny reference not value, no need to assign the returned value
    res.json(matchedTodo);
});

db.sequelize.sync().then(function (){
    app.listen(PORT, function(){
        console.log('Express listening on port: '+PORT+"!");
    });
});

