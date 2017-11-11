var app = require('./app');
var config = require('./config');
var http = require('http');

//SDK Version: 2.x 3.x
// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = 'ACe03f9c0af679a3ecf70397c2449864e7';
var authToken = '21082c34665dcefbdd5ae6bded1b3fda';
var client = require('twilio')(accountSid, authToken);

client.calls.create({
		url: 'https://a52d94d6.ngrok.io/voice',
    to: '+34636414588',
    from: '+34911983078',
		StatusCallback : 'https://a52d94d6.ngrok.io/status',
		StatusCallbackEvent : 'answered'

}, function(err, call) {
    process.stdout.write(call.sid);
});

// Create HTTP server and mount Express app
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server started on *:'+config.port);
});
