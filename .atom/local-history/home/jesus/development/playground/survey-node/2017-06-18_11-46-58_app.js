var path = require('path');
var express = require('express');
var morgan = require('morgan');
var urlencoded = require('body-parser').urlencoded;
var config = require('./config');
var voice = require('./routes/voice');
var router = require('./routes/router');
var Promise = require('bluebird');

var isConn;
// initialize MongoDB connection
// Create Express web app with some useful middleware
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(router);

// Twilio Webhook routes
app.post('/voice', voice.interview);
app.post('/voice/:responseId/record/:questionIndex', voice.recorded);
app.post('/status', voice.status);

// Ajax route to aggregate response data for the UI
app.get('/results', results);

module.exports = app;
