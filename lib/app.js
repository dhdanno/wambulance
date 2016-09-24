#!/usr/bin/env node

// Lisen on the same message bus as stateman for down/up events
// If the LAST event in the state_table was an alert event, then don't alert again
// Otherwise create an alert.

var CHANNEL  = "test1";
var AMQPHOST = "localhost";

var amqp         = require('amqplib/callback_api');
var logger       = require('./logger.js');
var es_query     = require('./es_query.js');
var es_states    = require('./es_states.js');
var notifier     = require('./notifier.js');
var AsyncPolling = require('async-polling');
var mysql_states = require('./mysql_states.js');

logger.log("app.js:: child process started");


amqp.connect('amqp://localhost', function(err, conn) {

  conn.createChannel(function(err, ch) {
    var q = 'hello';

    //ch.assertQueue(q, {durable: true});
    logger.log(' [*] Waiting for messages in '+q+'. To exit press CTRL+C');

    ch.consume(q, function(msg) {
      logger.log(' [x] Received '+msg.content.toString());

        json_message = msg.content.toString();
        json_message = JSON.parse(json_message);
        
	// if the last event was down the
        if(json_message.data.state == 'down') {
          logger.log(json_message.data.state+' state detected');
          mysql_states.select_last(json_message.data.client, function (hits) {
            //logger.log('last select '+hits);
            if (hits[0] == undefined || hits[0].state == 'up') {
	      logger.log('last event was down alerting, alerting');
              notifier.send_slack(json_message.data.client + " Is Down");
              mysql_states.insertorupdate(json_message.data.client, 
                               'down', 
                               json_message.data.trans_id);
            }
 	  });
        }

        // UP
        if(json_message.data.state == 'up') {
          logger.log(json_message.data.state+' state detected');
          mysql_states.select_last(json_message.data.client, function (hits) {
            logger.log("last select "+hits);
            if (hits[0] == undefined || hits[0].state == 'down') {
              logger.log('last event was up, alerting');
              notifier.send_slack(json_message.data.client + " Is Up");
              mysql_states.insertorupdate(json_message.data.client,
                               'up',
                               json_message.data.trans_id);
            }
          });
        }

      }, {noAck: true});


  });
});


// Implement polling later to repeat alerts for long periods of downtime
// This will include alert-classes that specify the time interval for alerts
