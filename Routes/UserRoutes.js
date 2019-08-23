var express = require('express');
var router = express.Router();
var User = require('../Models/user.model');
import { SESS_NAME } from "../config";

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
        const sessionUser = sessionizeUser(newUser);
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
        res.clearCookie(SESS_NAME);
        return res.status(200).send(user.username' logged in successfully'); // pass logemail to log back in
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// Get username with sessions
router.get('/auth', function (req, res, next) {
  User.findById(req.session.userId)
    //console.log(req.session.userId)
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
            "auth": true,
            "username": user.username,
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
