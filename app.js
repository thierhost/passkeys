var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();
var useragent = require('express-useragent');
 
app.use(useragent.express());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    proxy: true,
    cookie:{
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    }
  }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

module.exports = app;
