var path = require('path');
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var urlencoded = require('body-parser').urlencoded;
var config = require('./config');
var voice = require('./routes/voice');
var message = require('./routes/message');
var results = require('./routes/results');
var router = require('./routes/router');
var Promise = require('bluebird');

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs');
let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
});
var params = {
  text: 'Hola, Jesús, estoy muy contento de poder ayudarte y guiarte en esta movida',
  voice: 'es-ES_EnriqueVoice', // Optional voice
  accept: 'audio/wav'
};
text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));



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
app.use(router);

// Twilio Webhook routes
app.post('/voice', voice.interview);
app.post('/voice/:responseId/record/:questionIndex', voice.recorded);
app.post('/message', message);
app.post('/status', voice.status);

// Ajax route to aggregate response data for the UI
app.get('/results', results);

module.exports = app;
