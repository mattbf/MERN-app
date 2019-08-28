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

//Updateing User bio
router.post('/:username/update', function(req, res) {
  let username = req.params.username;
  console.log(req.body)
  console.log(req.params.username)
  User.findOne({ username: username }, function (err, user){
    if (err) {
      res.status(404).send("User not found");
    } else {
      console.log(user.bio)
      user.bio = req.body.bio;
      user.save().then(user => {
          res.json('User bio Update' + user);
      })
    }
  });
})

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
            Article.find({author: profile}, function(err, authorArticles) {
                if (err) {
                    console.log(err);
                } else {
                  // return res.json({
                  //   'articles': authorArticles
                  // })
                  Article.find().count({author: profile, 'comments.author': profile}, function(err, comments) {
                      if (err) {
                          console.log(err);
                      } else {
                        return res.json({
                          'profile': {
                            'username': userProfile[0].username,
                            'role': userProfile[0].role,
                            'email': userProfile[0].email,
                            'createdAt': userProfile[0].createdAt,
                            'bio': userProfile[0].bio
                          },
                          'articles': authorArticles,
                          'comments': comments
                        })
                      }
                  })
                }
            })


        })
    }}})
});
//User.find({name:'vlad','links.url':req.params.query}


module.exports = router;
