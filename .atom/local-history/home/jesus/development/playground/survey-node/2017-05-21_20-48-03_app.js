var path = require('path');
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var urlencoded = require('body-parser').urlencoded;
var config = require('./config');
var voice = require('./routes/voice');
var message = require('./routes/message');
var results = require('./routes/results');
var Promise = require('bluebird');

// use node A+ promises
mongoose.Promise = Promise;

// check for connection string
if (!config.mongoUrl) {
  throw new Error('MONGO_URL env variable not set.');
}

var isConn;
// initialize MongoDB connection
if (mongoose.connections.length === 0) {
  mongoose.connect(config.mongoUrl);
} else {
  mongoose.connections.forEach(function(conn) {
    if (!conn.host) {
      isConn = false;
    }
  })

  if (isConn === false) {
    mongoose.connect(config.mongoUrl);
  }
}

// Create Express web app with some useful middleware
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));
app.use(morgan('combined'));

// Twilio Webhook routes
app.post('/voice', voice.interview);
app.post('/voice/:responseId/transcribe/:questionIndex', voice.transcription);
app.post('/message', message);

// Ajax route to aggregate response data for the UI
app.get('/results', results);

//SDK Version: 2.x 3.x
// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = 'ACe03f9c0af679a3ecf70397c2449864e7';
var authToken = "21082c34665dcefbdd5ae6bded1b3fda";
var client = require('twilio')(accountSid, authToken);

client.calls.create({
	url: "http://tolchoco.net/twilio/welcome.xml",
    to: "+34636414588",
    from: "+34911983078",
    machineDetection : true

}, function(err, call) {
    process.stdout.write(call.sid);
});

module.exports = app;
