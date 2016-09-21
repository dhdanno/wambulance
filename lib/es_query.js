// Query ElasticSearch
// Daniel Korel | 2016

// Look for a record. If we find it then 
var elasticsearch = require('elasticsearch');
var logger        = require('./logger.js');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});


// Decide whether to POST or UPDATE
function putpost(domain, state) {
  console.log("putpost initiated");
  if (post_domain(domain, state) == false) {
    logger.log("es_query.putpost:: Document exists, performing update instead");
    logger.log(update_domain(domain, state));
    return true;
  }
}

// Take a variable as the alert_type using object literal syntax
function set_alerted(domain, alert_type) {
  var err;
  client.update({
    index: 'state_table',
    type: 'test',
    id: domain,
    body: {
      doc: {
        [alert_type]: 1
      }
    }

  }, function (error, response) {
    err = error;
  })

  return err;
}

// Get all down records to alert on accept callback
function get_state(fn, state) {
  client.search({
    index: 'state_table',
    type: 'test',
    body: {
      query: {
        match: {
          state: state
        }
      }
    }
  }).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(hits);
    fn(hits); //pass hits back inside a callback
    return hits;

  }, function (err) {
    console.trace(err.message);
  });


}


// getting the ID won't be needed if we always use the domain as the ID
function get_id(data) {
  client.search({
    index: 'state_table',
    type: 'test',
    body: {
      query: {
        match: {
          domain: data
        }
      }
    }
  }).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(hits);
    return hits;

  }, function (err) {
    console.trace(err.message);
  });

}

// Create
function post_domain(domain, state) {
  var err = false;
  client.create({
    index: 'state_table',
    type: 'test',
    id: domain,   //make the id a domain to lock it
    body: {
      domain: domain,
      state: state,
      published_at: '2013-01-01',
      counter: 1
    }
  }, function (error, response) {
      
    //console.log(error.displayName);
    if (error !== undefined && error.displayName == 'Conflict') {
       //logger.log("es_query.post_domain:: found conflicting doc.");
       return err;
    }

  });

  return err;

}

function update_domain(domain, state) {
  var err;
  client.update({
    index: 'state_table',
    type: 'test',
    id: domain,
    body: {
      doc: {
        state: state
      }
    }

  }, function (error, response) {
    err = error;
  })

  return err;

} 

// Export Functions
module.exports.set_alerted   = set_alerted;
module.exports.get_state     = get_state;
module.exports.putpost       = putpost;
module.exports.update_domain = update_domain;
module.exports.post_domain   = post_domain;
module.exports.get_id        = get_id;
