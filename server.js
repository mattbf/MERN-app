const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 4000;

var articleRouter = require('./Routes/ArticleRoutes');
var userRouter = require('./Routes/UserRoutes')

//user session pakckages
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/articles', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.use('/articles', articleRouter);
app.use('/user', userRouter);



app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
