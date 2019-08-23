const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
import { PORT, NODE_ENV } from './config';
//const PORT = 4000;

var articleRouter = require('./Routes/ArticleRoutes');
var userRouter = require('./Routes/UserRoutes')

//user session pakckages
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(cors());
app.use(bodyParser.json());
//express.session({cookie: { domain: '.app.localhost', maxAge: 24 * 60 * 60 * 1000 }})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
//app.use(cors({credentials: true, origin: 'http://localhost:3000', domain: ".app.localhost"}));
mongoose.connect('mongodb://127.0.0.1:27017/articles', { useNewUrlParser: true });
var db = mongoose.connection;
db.once('open', function() {
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

app.use(session({
      name: SESS_NAME,
      secret: SESS_SECRET,
      saveUninitialized: false,
      resave: false,
      store: new MongoStore({
        mongooseConnection: db,
        collection: 'session',
        ttl: parseInt(SESS_LIFETIME) / 1000
      }),
      cookie: {
        sameSite: true,
        secure: NODE_ENV === 'production',
        maxAge: parseInt(SESS_LIFETIME)
      }
    }));

app.use('/articles', articleRouter);
app.use('/user', userRouter);



app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
