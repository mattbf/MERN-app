var express = require('express');
var router = express.Router();
var User = require('../Models/user.model');
let Article = require('../Models/article.model');
const SESS_NAME=process.env.SESS_NAME

// // Don't need to display
// router.get('/', function (req, res, next) {
//   return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
// });

const roles = {
    'user': { can: [] },
    'admin': { can: ['read', 'write'] },
}


//POST route for updating data
router.post('/', function (req, res, next) {

  if (req.body.email &&
    req.body.username &&
    req.body.password) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function (error, user) {
      if (error) {
        if (error.code === 11000) {
          // email or username could violate the unique index. we need to find out which field it was.
          let message = "duplicate error"
          let field = error.message.split(" ")[7];
          field = field.split('_')[0]
          if (field == 'email') {
            message = "This user already exists"
          } else {
            message = "username is taken"
          }

          return res.json({
            'message': message,
            'value': field
          });
        }
        return next(error);
      } else {

        req.session.userId = user._id;
        return res.status(200).json({
          'username': user.username,
          'email': user.email,
          'role': user.role,
          'createdAt': user.createdAt,
        });
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        console.log(user.username + " logged in Session: " + req.session.userId)
        return res.status(200).send(user.username + ' logged in successfully'); // pass logemail to log back in
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

//Check if logged in
router.get('/auth', function (req, res, next) {
  console.log(req.session)
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.json({
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'createdAt': user.createdAt,
          });
        }
      }
    });
});
// router.get('/auth', ({ session: { user }}, res) => {
//   res.send({ user }); //will either be user obj or undefined
// });

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        res.clearCookie(SESS_NAME);
        return res.status(200).send(req.session + ' logged out');
      }
    });
  }
});

//GET profile page
router.get('/test/:username', function (req, res, next) {
  //console.log(req.session)
  let profile = req.params.username;
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          //get all the articles
          Article.find(function(err, articles) {
              if (err) {
                  console.log(err);
              } else {
                  articles.find({ author: profile }, function (err, authorArticles) {
                    if (err) {
                        console.log(err + 'Error finding articles');
                        res.status(400).send("Error finding articles")
                    } else {
                      //found articles for user
                      articles.comments.find().count({ author: profile }, function (err, authorComments) {
                        if (err) {
                            console.log(err + 'Error finding Comments');
                            res.status(400).send("Error finding Comments")
                        } else {
                          //found comments for user
                          console.log("success, found profile info")
                          return res.json({
                            user: {
                              username: user.username,
                              role: user.role,
                              email: user.email,
                              createdAt: user.createdAt,
                              bio: user.bio
                            },
                            articles: authorArticles,
                            commentsCount: authorComments,
                          })
                        }
                      })
                    }
              })
          }

          })
        }
      }
    })
});

router.get('/:username', function (req, res, next) {
  //console.log(req.session)
  let profile = req.params.username;
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          User.find({username: profile}, function(err, userProfile) {
            console.log(userProfile)
            Article.find(function(err, articles) {
                if (err) {
                    console.log(err);
                } else {
                  return res.json({'articles': articles})
                  // articles.comments.find({ author: profile }, function (err, authorComments) {
                  //   if (err) {
                  //       console.log(err + 'Error finding articles');
                  //       res.status(400).send("Error finding articles")
                  //   } else {
                  //     return res.json({'comments': authorComments})
                  //   }})
                }
          })
        })
    }}})
});


module.exports = router;
