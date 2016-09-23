// Utilizes ES as a transaction log for events. The last event for a domain reflects it's current state
var moment        = require('moment');
var logger        = require('./logger.js');
var mysql         = require('mysql');

// Globals 
var database     = 'yams_events';
var state_table  = 'current_state';

var connection    = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : database
});
connection.connect(); //reuse the connection


// FUNCTIONS //

//Get the single most recent event
function select_last(domain, fn) {
 // most recent single record
 connection.query('SELECT * FROM '+state_table+' WHERE domain = "'+domain+'" ORDER BY last_change DESC LIMIT 1', function(err, rows, fields) {
   if (err) throw err;
   console.log('The solution is: ', rows[0].domain);
   fn(rows);
  });
}

// Insert a single event
function insert(domain, state, trans_id) {

 var now   = moment().format();
 var post  = {domain: domain, state: state, trans_id: trans_id, last_change: now};
 var query = connection.query('INSERT INTO current_state SET ?', post, function(err, result) {
   // Neat!
 });
 console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'

 
}

// Export Functions
module.exports.select_last = select_last;
module.exports.insert      = insert;
