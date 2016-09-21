#!/usr/bin/env node

// Query the state table periodically
// Notify if the state is down

var logger       = require('./logger.js');
var es_query     = require('./es_query.js');
var notifier     = require('./notifier.js');
var AsyncPolling = require('async-polling');

logger.log("app.js:: child process started");

var polling = AsyncPolling(function (end) {
    logger.log("Starting loop");
	
    // check the state table for anything that's down

    // send an alert for anything we find

  es_query.get_state(function(hits) {

    for (var i = 0, l = hits.length; i < l; i++) {
      var obj = hits[i];

      // DOMAIN DOWN
      if (obj._source.state == 'down') {    
        // alert only once per record
        if(obj._source.down_alert == '0') {
          logger.log("Sending DOWN alert for "+obj._source.domain);
          notifier.send_slack(obj._source.domain+ " Is Down ");
          es_query.set_alerted(obj._source.domain, 'down_alert');
        } else {
          logger.log(obj._source.domain+" Was already alerted, skipping");
	} 
      }
    }
  }, 'down');

  // UP
  es_query.get_state(function(hits) {
    for (var i = 0, l = hits.length; i < l; i++) {
      var obj = hits[i];

      // DOMAIN UP
      if (obj._source.state == 'up') {
        // alert when it comes back
        console.log(obj._source.domain + " found up");
        if(obj._source.up_alert == '0') {
          logger.log("Sending UP alert for "+obj._source.domain);
          notifier.send_slack(obj._source.domain+ " Came Back ");
          es_query.set_alerted(obj._source.domain, 'up_alert');
        } else {
          logger.log(obj._source.domain+" Was already alerted, skipping");
        }
      }
    }
  }, 'up');

    end();
}, 6000);
polling.on('error', function (error) {
    logger.log("Polling Error: "+error);
});
polling.on('result', function (result) {
    logger.log("return from polling: "+result);
});
polling.run();

