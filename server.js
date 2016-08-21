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
    res.json(todos);        //.json == JSON,stringify()
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

app.listen(PORT, function(){
   console.log('Express listening on port: '+PORT+"!");
});