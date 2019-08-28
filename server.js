const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
//import { PORT, NODE_ENV, SESS_NAME, SESS_SECRET, SESS_LIFETIME } from './config'  //require('./config');
//const serverConfig = require('./config')
const dotenv = require('dotenv');
require('dotenv').config();
//var PORT = serverConfig.PORT
const PORT = process.env.PORT;
const SESS_LIFETIME = process.env.SESS_LIFETIME
const NODE_ENV=process.env.NODE_ENV
const SESS_NAME=process.env.SESS_NAME
const SESS_SECRET=process.env.SESS_SECRET
console.log(NODE_ENV === 'production')

var articleRouter = require('./Routes/ArticleRoutes');
var userRouter = require('./Routes/UserRoutes')
var adminRouter = require('./Routes/AdminRoutes')

//user session pakckages
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


//app.use(cors());
app.use(bodyParser.json());
//express.session({cookie: { domain: '.app.localhost', maxAge: 24 * 60 * 60 * 1000 }})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
const corsConfig = {
    origin:['http://localhost:3000'],
    methods:['GET','POST'],
    credentials: true,
};
app.use(cors(corsConfig));
//app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

mongoose.connect('mongodb://127.0.0.1:27017/articles', { useNewUrlParser: true });

var db = mongoose.connection;
db.once('open', function() {
    console.log("MongoDB database connection established successfully");
})


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
        maxAge: parseInt(SESS_LIFETIME),
      }
    }));

app.use('/articles', articleRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);



app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
