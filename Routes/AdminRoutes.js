var express = require('express');
var router = express.Router();
var User = require('../Models/user.model');
let Article = require('../Models/article.model');
const SESS_NAME=process.env.SESS_NAME


const roles = {
    'user': { can: [] },
    'admin': { can: ['read', 'write'] },
}


// GET admin page
router.get('/', function (req, res, next) {
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
              Article.find(function(err, articles) {
                  if (err) {
                      console.log(err);
                  } else {
                      let allArticles = articles
                      //res.json(articles);
                  }
              });
              return res.json({
                articles: allArticles,
                users: users
              }) //success
            }
          })
      }
    }
  });

});


module.exports = router;
