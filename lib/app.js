#!/usr/bin/env node

// Query the state table periodically
// Notify if the state is down

var logger       = require('./logger.js');
var es_query     = require('./es_query.js');
var notifier     = require('./notifier.js');
var AsyncPolling = require('async-polling');

logger.log("app.js:: child process started");

AsyncPolling(function (end) {
    logger.log("Starting loop");
	
    // check the state table for anything that's down

    // send an alert for anything we find

  es_query.get_down(function(hits) {

    for (var i = 0, l = hits.length; i < l; i++) {
      var obj = hits[i];
      if (obj._source.state == 'down') {
        
        // alert only once per record
        if(obj._source.alerted == '0') {
          logger.log("Sending alert for "+obj._source.domain);
          notifier.send_slack(obj._source.domain+ " Is Down ");
          es_query.set_alerted(obj._source.domain);
        } else {
          logger.log(obj._source.domain+" Was already alerted, skipping");
	} 
      }
     
    }

  });


    end();
}, 6000).run();
