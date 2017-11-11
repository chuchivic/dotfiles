'use strict';

const config = require('../../config');
const utils = require('../../lib/utils');
const request = require('request-promise');
const moment = require('moment');
const _ = require('underscore');
const User = require('../../adapters/facebook/user');
const ActionHandler = require('../../adapters/facebook/actionHandler');
const operations = require('../../adapters/facebook/operations/operationIndex');
const stayBotMenu = require('../../adapters/facebook/actions/branded/stayBotMenu');

const Stay = function (appId) {

  const app = _.findWhere(config.apps, {id: appId});


  return function (controller, mainBot) {

    const actionHandler = new ActionHandler({appId: 'branded'});

    // controller.hears(['hello'], 'message_received', function (bot, message) {
    //
    //   bot.reply(message, 'Hey there.');
    //
    // });


    controller.on('tick', function (event) {

    });

    controller.on('messaging_referral', function (bot, message) {
      console.log("Recibido referral " + message.referral.ref + " desde usuario " + message.user);
      let user = new User({id: message.user});
      user.fetch(function (userData) {
        actionHandler.resolve('LOGIN_REFERRAL', message, userData, mainBot, app, bot);
      });
    });

    controller.on('facebook_postback', function (bot, message) {
      console.log('POSTBACK received', message);
      let user = new User({id: message.user});
      // user.fetch(function (userData) {
        if (message.payload.indexOf("GET_STARTED") !== -1) {
          actionHandler.resolve('START_SURVEY', message, {}, mainBot, app, bot);
        }
        // TODO revisar cómo es el payload de Facebook para diferenciar una encuesta de otra
        // if (message.payload.indexOf("GET_STARTED") !== -1) {
          // actionHandler.resolve('START_SURVEY_FEED', message, {}, mainBot, app, bot);
        // }

      // });

    });

  }
};

module.exports = Stay;