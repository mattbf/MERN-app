const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = 4000;
let Todo = require('./todo.model');
let Article = require('./article.model');
app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb://127.0.0.1:27017/todos', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

//Articles
articleRoutes.route('/').get(function(req, res) {
    Article.find(function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.json(articles);
        }
    });
});
articleRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, article) {
        res.json(article);
    });
});
articleRoutes.route('/add').post(function(req, res) {
    let article = new Article(req.body);
    article.save()
        .then(article => {
            res.status(200).json(
              {
                'article': 'article added successfully',
                'body': article
            });
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

app.use('/articles', articleRoutes);


//TODOS
todoRoutes.route('/').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});
todoRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});
todoRoutes.route('/update/:id').post(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;
            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});
todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json(
              {
                'todo': 'todo added successfully',
                'body': todo
            });
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});
app.use('/todos', todoRoutes);
app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
