// Export node modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

// Import the dotenv file that contains database configurations
require('dotenv').config();

// Import routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Promises
var Promise = require('bluebird');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Form validators
var expressValidator = require('express-validator');

// This is for parsing dates
var moment = require('moment');

// This module let us use HTTP verbs such as PUT or DELETE in places where they are not supported
var methodOverride = require('method-override');

// Using custom logic to override method
// There are other ways of overriding as well like using header & using query value
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// This module shows flash messages generally used to show success or error messages
// Flash messages are stored in session
// So, we also have to install and use cookie-parser & session modules
// Authentication Packages
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');

// Database credentials
var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Session
// var sessionStore = new MySQLStore(options);

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   store: sessionStore,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: Date.now() + (30 * 86400 * 1000)
//   }
// }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialise passport
app.use(passport.initialize());

// Persistent login sessions
app.use(passport.session());
app.use(flash());

// Store user data on session
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  if (req.isAuthenticated()) {
    res.locals.account_no = req.user[0].account_no;
    res.locals.account_name = req.user[0].first_name + ' ' + req.user[0].last_name;
    res.locals.account_type = req.user[0].account_type;
  }
  next();
});

// Adding middleware stack
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Authentication
passport.use(new LocalStrategy(
  function (username, password, done) {
    var pool = require('./models/database');

    pool.query('SELECT * FROM accounts_tbl WHERE username = ?', [username], function (error, results, fields) {
      if (error) {
        done(error);
      }

      if (results.length === 0) {
        done(null, false);
      } else {
        var hash = results[0].password.toString();

        bcrypt.compare(password, hash, function (error, response) {
          if (response === true) {
            return done(null, results);
          } else {
            return done(null, false);
          }
        })
      }
    })
  }
));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3006, function () {
  console.log('Server running at port 3006!');
});

module.exports = app;

