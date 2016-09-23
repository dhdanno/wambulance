#!/usr/bin/env node

// Lisen on the same message bus as stateman for down/up events
// If the LAST event in the state_table was an alert event, then don't alert again
// Otherwise create an alert.

var CHANNEL  = "ALERT_QUEUE";
var AMQPHOST = "localhost";

var amqp         = require('amqplib/callback_api');
var logger       = require('./logger.js');
var es_query     = require('./es_query.js');
var es_states    = require('./es_states.js');
var notifier     = require('./notifier.js');
var AsyncPolling = require('async-polling');
var mysql_states = require('./mysql_states.js');

logger.log("app.js:: child process started");

mysql_states.insert("poop.com", "sdfsdf", "down");

mysql_states.select_last("poop.com", function(rows) {
  console.log("DIS: "+rows[0].domain + "date: "+rows[0].last_change);
});

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = CHANNEL;

      ch.assertQueue(q, {durable: false});

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

      ch.consume(q, function(msg) {
      
        json_message = msg.content.toString();
        json_message = JSON.parse(json_message);
        
        logger.log(" [x] %s", json_message);

	// if the last event was down the
        if(json_message.data.state == 'down') {
          logger.log(json_message.data.state+" state detected");
          es_states.select_last(json_message.data.client, function (hits) {
            if (hits[0]._source.event == 'alerted_down') {
              logger.log("last event was alerted, skipping");
	    } else if (hits[0]._source.event == 'down') {
	      logger.log("last event was down alerting");
              notifier.send_slack(json_message.data.client + " Is Down");
              es_states.insert(json_message.data.client, 
                               'alerted_down', 
                               json_message.data.trans_id);
            }
 	  });
        }

        // if the last event was up the
        if(json_message.data.state == 'up') {
          logger.log(json_message.data.state+" state detected");
          es_states.select_last(json_message.data.client, function (hits) {
            if (hits[0]._source.event == 'alerted_up') {
              logger.log("last event was alerted, skipping");
            } else if (hits[0]._source.event == 'up') {
              logger.log("last event was down alerting");
              notifier.send_slack(json_message.data.client + " Is Up");
              es_states.insert(json_message.data.client, 
                               'alerted_up',
                                json_message.data.trans_id);
            }
          });
        }

      }, {noAck: true});


  });
});





// Implement polling later to repeat alerts for long periods of downtime
// This will include alert-classes that specify the time interval for alerts
