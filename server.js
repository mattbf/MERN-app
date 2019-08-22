const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const allRoutes = express.Router();
const PrettyUrl = require('./Utils/PrettyUrl');
const PORT = 4000;
let Todo = require('./todo.model');
let Article = require('./article.model');
app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb://127.0.0.1:27017/articles', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

//Articles
allRoutes.route('/').get(function(req, res) {
    Article.find(function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.json(articles);
        }
    });
});
allRoutes.route('/:slug').get(function(req, res) {
    // Article.find({ title: req.params.title }, '_id', function (err, id) {
    //   if (err) {
    //       console.log(err);
    //   } else {
    //       res.json(id);
    //
    //   }
    // })
    let slug = req.params.slug;
    Article.findOne({ slug: slug }, function (err, article) {
      console.log(slug)
      if (err) {
          console.log(err);

      } else {
          res.json(article);
      }
    })
    //let id = req.params.id;
    // Article.findById(id, function(err, article) {
    //   if (err) {
    //       console.log(err);
    //   } else {
    //       res.json(article);
    //   }
    // });

});
allRoutes.route('/add').post(function(req, res) {
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
            res.status(400).send('adding new Article failed');
            console.log(article)
        });
});
//Add comments to article
allRoutes.route('/:slug/comments').post(function(req, res) {
    let slug = req.params.slug;
    Article.findOne({ slug: slug }, function (err, article) {
        if (!article)
            res.status(404).send("Article not found");
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

app.use('/articles', allRoutes);




//TODOS
allRoutes.route('/').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});
allRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});
allRoutes.route('/update/:id').post(function(req, res) {
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
allRoutes.route('/add').post(function(req, res) {
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
app.use('/todos', allRoutes);
app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
