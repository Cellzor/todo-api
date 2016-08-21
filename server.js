/**
 * Created by Christian on 2016-08-20.
 */
var express = require('express');
var bodyParser = require('body-parser');

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
    var matchedTodo;
    for(var i=0; i<todos.length; i++){
        if(todos[i].id === todoId){
            matchedTodo = todos[i];
        }
    }
    if (!matchedTodo){
        res.status(404).send();
    }else {
        res.json(matchedTodo);
    }
});

app.post('/todos', function(req, res){
    var body = req.body;    //middleware parses this to JSON before coming here
    console.log('description ' + body.description);
    todos.push({
        id: todoNextId,
        description: body.description,
        completed: body.completed
    });
    todoNextId++;
    res.json(body);
});

app.listen(PORT, function(){
   console.log('Express listening on port: '+PORT+"!");
});