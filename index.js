'use strict';

let config = require('./config.json');

const DATABASE_FILE = config.db.file;
const DATABASE_TABLE = config.db.table;

const ADMIN_PAGE = config.admin.page;
const PORT = config.server.port;
const SHORT_URL_SUBDIR = config.shorturls.subdir;

const TABLE_CREATE_STMT = `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLE} (id INTEGER PRIMARY KEY, target TEXT, added INTEGER)`;
const URL_FETCH_STMT = `SELECT target FROM ${DATABASE_TABLE} WHERE id=$id`;
const URL_INSERT_STMT = `INSERT INTO ${DATABASE_TABLE}(target, added) VALUES($target, $added)`;

let express = require('express');
let bodyParser = require('body-parser');
let sqlite3 = require('sqlite3');
let urlCheckRegex = require('url-check-regex');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let db = new sqlite3.Database(DATABASE_FILE);
db.run(TABLE_CREATE_STMT);

app.get(`${SHORT_URL_SUBDIR}/:id`, function(req, res) {
  db.get(URL_FETCH_STMT, req.params.id, function(err, rows) {
    res.redirect(rows.target);
  })
})

app.post(ADMIN_PAGE, function(req, res) {
  let target = req.body.target;
  if(urlCheckRegex.test(target)) {
    db.run(URL_INSERT_STMT, target, Date.now(), function(err) {
      res.status(400).json({
        id: this.lastID,
        url: `${SHORT_URL_SUBDIR}/${this.lastID}`,
      });
    });
  }

  else {
    res.json({
      error: 'Invalid url',
    });
  }
});
// on close, close db

app.listen(PORT, function () {
  console.log(`Running on port ${PORT}!`);
});
