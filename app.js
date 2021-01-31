var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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

app.get('/', (req, res) => {

  const query = `SELECT * FROM news`;
  db.all(query, [], (err, rows) => {
      if (err)
      {
          console.error(err.message);
      }
      res.render('./pages/index', {
        news: rows
    });
  });

});

// GET article creation page
app.get('/create', (req, res) => {
  res.render('pages/create');
});

// GET articlr edit page
app.get('/edit/:id', (req, res) => {

  if (isNaN(req.params.id))
    {
        return;
    }

  const query = `SELECT * FROM news WHERE id = ${req.params.id}`;
  db.all(query, [], (err, rows) => {
      if (err)
      {
          console.error(err.message);
      }

      res.render('./pages/edit', {
        news: rows
    });
  });

});

// GET selected news from id
app.get('/news/:id', (req, res) => {

  if (isNaN(req.params.id))
    {
        return;
    }

  const query = `SELECT *, news.content as nw_content, 
                          news.published_at as published_at,
                          news.id as id,
                          comments.id as com_id, 
                          comments.content as com_content,
                          comments.published_at as com_date
                          FROM news, comments 
                          WHERE news.id = ${req.params.id} 
                          AND comments.artid = ${req.params.id}`;
  db.all(query, [], (err, rows) => {
      if (err)
      {
          console.error(err.message);
      }

      res.render('./pages/news', {
        news: rows,
        comments: rows
    });
  });

});

/**
 * POST new article
 */
app.post('/add', (req, res) => {
  const query = `INSERT INTO news (title, img, content, author_firstname, author_lastname, published_at)
      VALUES ('${req.body.inputTitle}', 
          '${req.body.inputImg}',
          '${req.body.inputContent}',
          '${req.body.inputPrenom}',
          '${req.body.inputNom}',
          '${new Date()}'
      )`;

  db.run(query, (err) => {
      if (err)
      {
          return console.error('ici: ', err.message);
      }
      console.log('News successfully created.');

  });
});

/**
 * Edit article
 */
app.post('/update/:id', (req, res) => {
  const query = `
          UPDATE news SET
          title = '${req.body.inputTitle}', 
          img = '${req.body.inputImg}',
          content = '${req.body.inputContent}',
          author_firstname = '${req.body.inputPrenom}',
          author_lastname = '${req.body.inputNom}'
          WHERE id = '${req.params.id}'
        `;

  db.run(query, (err) => {
      if (err)
      {
          return console.error('ici: ', err.message);
      }
      console.log('News successfully updated.');

  });
});

/**
 * delete news comments
 */
app.get('/delete/:id', (req, res) => {
  if (isNaN(req.params.id))
  {
      return;
  }

  const query = `DELETE FROM news WHERE id = ${req.params.id};`;

  db.run(query, (err) => {
      if (err)
      {
          return console.error(err.message);
      }
      console.log('News successfully deleted.');

      delNewsComments(req.params.id);
  });
});

/**
 * delete news
 */
function delNewsComments(id) {
  if (isNaN(id))
  {
      return;
  }

  const query = `DELETE FROM comments WHERE artid = ${id};`;

  db.run(query, (err) => {
      if (err)
      {
          return console.error(err.message);
      }
      console.log('News comments successfully deleted.');

  });
}

/**
 * POST new comment
 */
app.post('/comment', (req, res) => {
  const query = `INSERT INTO comments (artid, author, content, published_at)
      VALUES (
          '${req.body.inputID}',
          '${req.body.inputPrenom}',
          '${req.body.inputContent}',
          '${new Date()}'
      )`;

  db.run(query, (err) => {
      if (err)
      {
          return console.error('ici: ', err.message);
      }
      console.log('Comment successfully created.');

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
