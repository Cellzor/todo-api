/**
 * Created by Christian on 2016-08-20.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//setup middleware
app.use(bodyParser.json()); //parse body to JSON

app.get('/', function(req, res){
   res.send('Todo API Root');
});

app.get('/todos', function(req, res){
    var queryParams = req.query;
    var filteredTodos = todos;
    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
        filteredTodos = _.where(filteredTodos, {completed: true});
        res.json(filteredTodos);
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
        filteredTodos = _.where(filteredTodos, {completed: false});
        res.json(filteredTodos);
    }else {
        res.json(filteredTodos);        //.json == JSON.stringify()
    }
});

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if (!matchedTodo){
        res.status(404).send();
    }else {
        res.json(matchedTodo);
    }
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'id', 'completed');    //middleware parsed body to JSON before coming here

    //trim removes spaces before and after "   Test Test   " > "Test Test"
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
        return res.status(400).send(); //400 - incorrect data was provided
    }
    body.id = todoNextId++;
    body.description = body.description.trim();

    todos.push(body);
    res.json(body);
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

app.listen(PORT, function(){
   console.log('Express listening on port: '+PORT+"!");
});