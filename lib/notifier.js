function send_slack(message) {
 var token  = require('./tokens.js');
 var Slack  = require('slack-node');

 console.log(token.token); 
 slack = new Slack(token.token);
 
 slack.api("users.list", function(err, response) {
   //logger.log(response);
   //logger.log(err);
 });
 
 slack.api('chat.postMessage', {
   text: message,
   channel:'#general'
 }, function(err, response){
    //console.log(response);
    //logger.log(err);
 });


}

module.exports.send_slack = send_slack;
