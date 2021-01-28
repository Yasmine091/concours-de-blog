var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const sqlite3 = require('sqlite3').verbose();

// open database in memory
let db = new sqlite3.Database('./ressources/blog.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the Blog SQlite database.');
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/parts/navigation', (req, res) => {

  const query = `SELECT * FROM settings`;
  db.all(query, [], (err, rows) => {
      if (err)
      {
          console.error(err.message);
      }
      res.render('/parts/navigation', {
        site: rows
    });
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
