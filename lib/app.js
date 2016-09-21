#!/usr/bin/env node

// Lisen on the same message bus as stateman for down/up events
// If the LAST event in the state_table was an alert event, then don't alert again
// Otherwise create an alert.

var CHANNEL  = "CHAN";
var AMQPHOST = "localhost";

var amqp         = require('amqplib/callback_api');
var logger       = require('./logger.js');
var es_query     = require('./es_query.js');
var notifier     = require('./notifier.js');
var AsyncPolling = require('async-polling');

logger.log("app.js:: child process started");

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = CHANNEL;

    ch.assertExchange(ex, 'fanout', {durable: false});

    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, ex, '');

      ch.consume(q.queue, function(msg) {
        console.log(" [x] %s", msg.content.toString());
      }, {noAck: true});
    });
  });
});





// Implement polling later to repeat alerts for long periods of downtime
// This will include alert-classes that specify the time interval for alerts
