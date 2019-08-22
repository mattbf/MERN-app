var express = require('express');
var router = express.Router();
var User = require('../Models/user.model');


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
          return res.json(user.username);
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

// GET admin page
router.get('/admin', function (req, res, next) {
  //User.adminauth(req.body.email, req.body.password)
  User.authenticate(req.body.email, req.body.password, function (error, user) {
    if (error || !user) {
      var err = new Error('Wrong email or password.');
      err.status = 401;
      return next(err);
    } else {
      req.session.userId = user._id;
      const operation = 'read';
      console.log(user.role)
      if (
          !roles[user.role] ||
          roles[user.role].can.indexOf(operation) === -1
      ) {
          // early return if the access control check fails
          return res.status(404).send('Access Denied, not an Admin'); // or an "access denied" page NOT admin
      } else {
          User.find(function(err, users) {
            if (err) {
              console.log(err) //error getting user list
            } else {
              return res.json(users) //success
            }
          })
      }
    }
  });

});


module.exports = router;
