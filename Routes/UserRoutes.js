var express = require('express');
var router = express.Router();
var User = require('../Models/user.model');


// // Don't need to display
// router.get('/', function (req, res, next) {
//   return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
// });


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

          console.log(error.message)
          console.log(field)
          // field = field.split(" dup key")[0];
          // field = field.substring(0, field.lastIndexOf("_"));
          // req.flash("errors", [{
          //   msg: "An account with this " + field + " already exists."
          // }]);
          // res.redirect("/join");
          return res.json({
            'message': message,
            'value': field
          });
        }
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.status(200).send('user ' + user.username + ' created successfully');
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
        return res.status(200).send('user logged in with sessions successfully');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET profile after registering
router.get('/profile', function (req, res, next) {
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
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
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
        return res.status(200).send('user logged out');
      }
    });
  }
});

module.exports = router;


// if (error.code === 11000) {
//   // email or username could violate the unique index. we need to find out which field it was.
//   var field = error.message.split(".$")[1];
//   field = field.split(" dup key")[0];
//   field = field.substring(0, field.lastIndexOf("_"));
//   req.flash("errors", [{
//     msg: "An account with this " + field + " already exists."
//   }]);
//   res.redirect("/join");
//   return;
// }