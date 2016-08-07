'use strict';

let config = require('./config.json');

const DATABASE_FILE = config.db.file;
const DATABASE_TABLE = config.db.table;

const ADMIN_PAGE = config.admin.page;
const PORT = config.server.port;
const SHORT_URL_SUBDIR = config.shorturls.subdir;

const LOGGING = config.logging.active;
const LOG_FILE = config.logging.file;

const TABLE_CREATE_STMT = `CREATE TABLE IF NOT EXISTS ${DATABASE_TABLE} (id INTEGER PRIMARY KEY, target TEXT, added INTEGER)`;
const URL_FETCH_STMT = `SELECT target FROM ${DATABASE_TABLE} WHERE id=$id`;
const URL_INSERT_STMT = `INSERT INTO ${DATABASE_TABLE}(target, added) VALUES($target, $added)`;

let express = require('express');
let bodyParser = require('body-parser');
let sqlite3 = require('sqlite3');
let urlCheckRegex = require('url-check-regex');
let fs = require('fs');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let db = new sqlite3.Database(DATABASE_FILE);
db.run(TABLE_CREATE_STMT);

let logFile;
if(LOGGING) {
  logFile = fs.createWriteStream(LOG_FILE, { flags: 'a' });
}


app.get(`${SHORT_URL_SUBDIR}/:id`, function(req, res) {
  db.get(URL_FETCH_STMT, req.params.id, function(err, rows) {
    res.redirect(rows.target);
    if(LOGGING) {
      logFile.write('CLICK' + '\t' + req.params.id + '\t' + rows.target + '\n');
    }
  });
})

app.post(ADMIN_PAGE, function(req, res) {
  let target = req.body.target;
  if(urlCheckRegex.test(target)) {
    db.run(URL_INSERT_STMT, target, Date.now(), function(err) {
      res.status(400).json({
        id: this.lastID,
        url: `${SHORT_URL_SUBDIR}/${this.lastID}`,
      });

      if(LOGGING) {
        logFile.write('CREATE' + '\t' + this.lastID + '\t' + req.body.target + '\n');
      }
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
