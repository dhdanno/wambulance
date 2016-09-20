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
        logger.log("sending alert for "+obj._source.domain);     
        // call alert
      }
     
    }

  });


    end();
}, 6000).run();
