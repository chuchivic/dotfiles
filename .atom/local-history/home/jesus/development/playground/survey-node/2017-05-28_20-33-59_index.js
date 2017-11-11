var app = require('./app');
var config = require('./config');
var http = require('http');
var webhook_url = 'http://954ff297.ngrok.io';

//SDK Version: 2.x 3.x
// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = 'ACe03f9c0af679a3ecf70397c2449864e7';
var authToken = '21082c34665dcefbdd5ae6bded1b3fda';
var client = require('twilio')(accountSid, authToken);

client.calls.create({
		url:  webhook_url + '/welcome',
		//url:  webhook_url + '/voice',
    to: '+34636414588',
    from: '+34911983078',
		statusCallback : webhook_url + '/status',
		statusCallbackEvent : 'answered'
}, function(err, call) {
    process.stdout.write(call.sid);
});

// Create HTTP server and mount Express app
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server started on *:'+config.port);
});