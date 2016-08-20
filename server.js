/**
 * Created by Christian on 2016-08-20.
 */
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: "Meet mom for lunch",
    completed: false
}, {
    id: 2,
    description: "Go to market",
    completed: false
}, {
    id: 3,
    description: "Eat lunch",
    completed: true
}];

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
        console.log("gg");
        res.status(404).send();
    }else {
        res.json(matchedTodo);
    }
});

app.listen(PORT, function(){
   console.log('Express listenin on port: '+PORT+"!");
});