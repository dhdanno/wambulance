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

// Check if a record exists, if not create it.
function insertorupdate(domain, state, trans_id) {  

 select_last(domain, function(rows) {
 
   if ( rows[0] == undefined ) {
     insert(domain, state, trans_id);
     logger.log('Creating non-existent record for:  '+domain);
   } else {
     update(domain, state);
     logger.log('Record already exists, for '+domain+' updating... '); 
   }

 });

}

// Get the single most recent event
function select_last(domain, fn) {
 // most recent single record
 connection.query('SELECT * FROM '+state_table+' WHERE domain = "'+domain+'" ORDER BY last_change DESC LIMIT 1', function(err, rows, fields) {
   if (err) throw err;
    if (rows[0] != undefined) {
     logger.log('Sucessfully retrieved '+rows[0].domain+' from the database');
    }
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
 logger.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
}

// Update a single domains state
function update(domain, state) {
  var now   = moment().format(); 
  connection.query('UPDATE '+state_table+' SET state="'+state+'", last_change="'+now+'" WHERE domain="'+domain+'" LIMIT 1', function(err, rows, fields) {
   if (err) throw err;
   //logger.log('Updated the rows: ', rows[0].domain);
   //fn(rows);
  });
}

// Export Functions
module.exports.update         = update;
module.exports.insertorupdate = insertorupdate;
module.exports.select_last    = select_last;
module.exports.insert         = insert;
