var path = require('path');
var express = require('express');
var morgan = require('morgan');
var urlencoded = require('body-parser').urlencoded;
var config = require('./config');
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

module.exports = app;
