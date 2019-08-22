var express  = require('express');
var router = express.Router();
let Article = require('../Models/article.model');
var User = require('../Models/user.model');

//Get All Articles
router.route('/').get(function(req, res) {
    Article.find(function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.json(articles);
        }
    });
});
//Get one Article
router.route('/:slug').get(function(req, res) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return res.status(400).send("Not logged in");
      } else {
        if (user === null) {
          return res.status(401).send("Not authorized!");
        } else {
          let slug = req.params.slug;
          Article.findOne({ slug: slug }, function (err, article) {
            console.log(slug)
            if (err) {
                console.log(err + 'Could not find article');
            } else {
                res.json(article);
            }
          })
        }
      }
    });
});
//Post an Article
router.route('/add').post(function(req, res) {
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
//Add comments to an article
router.route('/:slug/comments').post(function(req, res) {
    let slug = req.params.slug;
    console.log(slug)
    Article.findOne({ slug: slug }, function (err, article) {
        if (!article)
            res.status(404).send("Article not found");
        else
            article.comments.push(req.body)
            article.save().then(article => {
                res.json('Comments added to ' + article.title);
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

module.exports = router;
