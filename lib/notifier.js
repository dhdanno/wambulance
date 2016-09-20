


function send_slack(message) {
 var token  = require('./tokens.js');
 var Slack  = require('slack-node');

 console.log(token.token); 
 slack = new Slack(token.token);
 
 slack.api("users.list", function(err, response) {
   console.log(response);
 });
 
 slack.api('chat.postMessage', {
   text: message,
   channel:'#general'
 }, function(err, response){
   console.log(response);
 });


}

module.exports.send_slack = send_slack;
