'use strict';

const utils = require('../../../../lib/utils');
const operations = require('../../operations/operationIndex');
const config = require('../../../../config');
var survey = require('../../../../lib/survey_data');
const moment = require('moment');
moment.locale('en');
const websiteButton = require('../../templates/websiteButton');

const startSurvey = function (message, userData, mainBot, app, bot) {

  let hasCar = null;
  let brand = null;
  let desiredBrand = null;
  let years = null;
  let newCar = null;
  let gas = null;
  let wantStudy = null;
  let province = null;
  let apology = function(message, convo){
    convo.say(survey.apology);
  }
  let askProvince = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askcountry;
    }
    convo.ask({
      text: text
    }, function (response, convo) {
      let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
      if (entities && entities[0] === 'province') {
        province = response.entities.province[0].value;
        console.log("Province", gas);
        convo.say(survey.thanks)
      } else if (entities && entities[0] === 'out'){
        apology(null, convo);
      } else {
        askProvince(null, convo, true);
      }

      convo.next();
    });
  };
  let askStudy = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askstudy;
    }
    convo.ask({
      text: text,
      quick_replies: [{
        'content_type': 'text',
        'title': 'Sí',
        'payload': 'yes'
      }, {
        'content_type': 'text',
        'title': 'No',
        'payload': 'no'
      }],
    }, function (response, convo) {
      if (response.quick_reply) {
        if (response.quick_reply.payload === 'yes') {
          wantStudy = true;
        } else {
          wantStudy = false;
        }
      } else {
        let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
        if (entities && entities[0] === 'yes') {
          wantStudy = true;
        } else if (entities && entities[0] === 'no') {
          wantStudy = false;
        } else if (entities && entities[0] === 'out'){
          apology(null, convo);
        }
      }
      if (wantStudy === null){
        askStudy(null, convo, true);
      } else {
        askProvince(null, convo);
      }
      convo.next();
    });
  };
  let askGas = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askgas;
    }
    convo.ask({
      text: text
    }, function (response, convo) {
      let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
      if (entities && entities[0] === 'gas') {
        gas = response.entities.gas[0].value;
        console.log("Gas", gas);
        askStudy(null, convo);
      } else if (entities && entities[0] === 'out'){
        apology(null, convo);
      } else {
        askGas(null, convo, true);
      }

      convo.next();
    });
  };
  let askFutureBrand = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askfuturebrand;
    }
    convo.ask({
      text: text
    }, function (response, convo) {
      let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
      if (entities && entities[0] === 'carbrand') {
        desiredBrand = response.entities.carbrand[0].value;
        askGas(null, convo);
        console.log("Desired brand", brand);
      } else if (entities && entities[0] === 'out'){
        apology(null, convo);
      } else {
        askFutureBrand(null, convo, true);
      }

      convo.next();
    });
  };
  let askFuture = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askfuture;
    }
    convo.ask({
      text: text,
      quick_replies: [{
        'content_type': 'text',
        'title': 'Sí',
        'payload': 'yes'
      }, {
        'content_type': 'text',
        'title': 'No',
        'payload': 'no'
      }],
    }, function (response, convo) {
      if (response.quick_reply) {
        if (response.quick_reply.payload === 'yes') {
          newCar = true;
        } else {
          newCar = false;
        }
      } else {
        let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
        if (entities && entities[0] === 'yes') {
          newCar = true;
        } else if (entities && entities[0] === 'no') {
          newCar = false;
        } else if (entities && entities[0] === 'out'){
          apology(null, convo);
        }
      }
      if (newCar === null) {
        askFuture(null, convo, true);
      } else if (newCar) {
        askFutureBrand(null, convo);
      } else if (newCar === false) {
        askProvince(null, convo);
      }
      convo.next();
    });
  };
  let askYears = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      text = survey.askyears;
    }
    convo.ask({
      text: text
    }, function (response, convo) {
      let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
      if (entities && entities[0] === 'car_years') {
        years = response.entities.car_years[0].value;
        console.log("Years", years);
        askFuture(null, convo);
      } else if (entities && entities[0] === 'out'){
        apology(null, convo);
      } else {
        askYears(null, convo, true);
      }

      convo.next();
    });
  };
  let askBrand = function (message, convo, repeat) {
    let text = survey.repeat;i
    if (!repeat){
      text = survey.askbrand;
    }
    convo.ask({
      text: text
    }, function (response, convo) {
      let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
      if (entities && entities[0] === 'carbrand') {
        brand = response.entities.carbrand[0].value;
        askYears(null, convo);
        console.log("Possessed brand", brand);
      } else if (entities && entities[0] === 'out'){
        apology(null, convo);
      } else {
        askBrand(null, convo, true);
      }

      convo.next();
    });
  };
  let welcome = function (message, convo, repeat) {
    let text = survey.repeat;
    if (!repeat){
      convo.say(survey.welcome);
      text = survey.haveacar;
    }
    convo.ask({
      text: text,
      quick_replies: [{
        'content_type': 'text',
        'title': 'Sí',
        'payload': 'yes'
      }, {
        'content_type': 'text',
        'title': 'No',
        'payload': 'no'
      }],
    }, function (response, convo) {
      if (response.quick_reply) {
        if (response.quick_reply.payload === 'yes') {
          hasCar = true;
        } else {
          hasCar = false;
        }
        if (hasCar === null) {
          welcome(null, convo, true);
        } else if (hasCar) {
          askBrand(null, convo);
        } else if (hasCar === false) {
          askFuture(null, convo);
        }
      } else {
        let entities = response.entities && Object.keys(response.entities).length ? Object.keys(response.entities) : null;
        if (entities && entities[0] === 'yes') {
          hasCar = true;
        } else if (entities && entities[0] === 'no') {
          hasCar = false;
        } else if (entities && entities[0] === 'out'){
          apology(null, convo);
        } else {
          welcome(null, convo, true);
        }
        if (hasCar) {
          askBrand(null, convo);
        } else if (hasCar === false) {
          askFuture(null, convo);
        }
      }

      convo.next();
    });
  };

  bot.startConversation(message, function (err, convo) {
    welcome(null, convo);
  });
  // let bookingEngineEnabled = app.establishmentConfig && app.establishmentConfig.bookingEnabled;
  //
  // if (bookingEngineEnabled) {
  //   bot.startTyping(message, function (err) {
  //     if (err) console.log('error:' + err);
  //     mainBot.getStrings(function (strings) {
  //       message.entities = message.entities || {};
  //       let entities = message.entities;
  //       let params = [];
  //       let url = config.currentAdminHost
  //         + '/booking'
  //         + '/' + app.establishmentConfig.cmsId
  //         // + '/' + userData.establishmentId
  //         + '/' + app.establishmentConfig.partnerId
  //         // + '/' + 'demo_urbano'
  //         + '/' + app.establishmentConfig.bookingEngine
  //         // + '/' + 'witbooking'
  //         + '/' + userData.locale
  //         + '/' + 'EUR'
  //         + '/' + userData.userKey
  //         + '/' + userData.deviceKey
  //         + '/' + app.apiKey //TODO use user's establishment ID
  //         + '/' + userData.id
  //         + '/' + config.facebook.pageAccessToken[app.id];
  //
  //       let preselectedValues = {};
  //       let adults = message.entities['adults_count'] ? message.entities['adults_count'][0].value : null;
  //       let kids = message.entities['children_count'] ? message.entities['children_count'][0].value : null;
  //       let duration = message.entities['days_count'] ? message.entities['days_count'][0].value : 0;
  //       if (message.entities['week_count']) {
  //         duration += message.entities['week_count'][0].value * 7;
  //       }
  //       let prevDays = [];
  //       let checkIn = message.entities['datetime'] ? (message.entities['datetime'][0].values[0].from ? new moment(message.entities['datetime'][0].values[0].from.value) : new moment(message.entities['datetime'][0].values[0].value).add(1, 'day')).format('YYYY-MM-DD') : null;
  //
  //       let transformAvailability = function (response) {
  //         let rates = response.hotel_room_rates;
  //         let room_types = response.hotel_room_types;
  //         let rate_plans = response.hotel_rate_plans;
  //
  //         let groupedRoomTypes = {};
  //         for (let key in room_types) {
  //           let roomType = room_types[key];
  //           let roomName = roomType.name;
  //
  //           let array = [];
  //           if (groupedRoomTypes[roomName]) {
  //             array = groupedRoomTypes[roomName];
  //           }
  //           array.push(roomType);
  //           groupedRoomTypes[roomName] = array;
  //         }
  //         console.log(groupedRoomTypes);
  //         let rooms = [];
  //         for (let key in groupedRoomTypes) {
  //           console.log(key);
  //           let array = groupedRoomTypes[key];
  //
  //           let roomRates = [];
  //           let parentRoomType = {};
  //           array.forEach(function (roomType) {
  //             parentRoomType = Object.assign({}, roomType);
  //             console.log('Room type', roomType);
  //             let ratesForThisRoom = rates.filter(function (rate) {
  //               return rate.hotel_room_type_code == roomType.code;
  //             });
  //             if (ratesForThisRoom) {
  //               ratesForThisRoom.forEach(function (rate) {
  //                 let ratePlan = rate_plans[rate.hotel_rate_plan_code];
  //                 rate.price = rate.final_price_at_checkout.amount + rate.final_price_at_booking.amount;
  //                 rate.currency = rate.final_price_at_booking.currency;
  //                 rate.accommodation = ratePlan.description;
  //                 rate.mealPlan = (ratePlan.meal_plan && ratePlan.meal_plan.custom) ? ratePlan.meal_plan.custom[0] : null;
  //
  //                 roomRates.push(rate);
  //               });
  //             }
  //
  //             if (roomType.photos && roomType.photos.length) {
  //               parentRoomType.imageUrl = roomType.photos[0].url;
  //             } else {
  //               parentRoomType.imageUrl = null;
  //             }
  //           });
  //           console.log('rates', roomRates);
  //
  //           roomRates.sort(function (a, b) {
  //             return (a.price - b.price);
  //           });
  //           parentRoomType.rates = roomRates;
  //
  //           rooms.push(parentRoomType);
  //         }
  //         console.log(rooms);
  //         rooms.sort(function (a, b) {
  //           return (a.rates[0].price - b.rates[0].price);
  //         });
  //         return rooms;
  //       };
  //       let getAvailability = function (response, convo) {
  //         let checkOut = new moment(checkIn).add(duration, 'days').format('YYYY-MM-DD');
  //         mainBot.getAvailability(app.establishmentConfig.cmsId, app.establishmentConfig.partnerId,
  //           userData.locale, 'EUR', app.establishmentConfig.bookingEngine, checkIn, checkOut,
  //           [{adults: adults}], (availability) => {
  //             console.log('Availability', availability);
  //             if (availability.hotel_room_rates) {
  //               let rooms = transformAvailability(availability);
  //               if (entities.indexOf && entities.indexOf('rooms_count') != -1) {
  //                 params.push('rooms=' + message.entities['rooms_count'][0].value);
  //               }
  //               if (adults) {
  //                 params.push('adults=' + adults);
  //               }
  //               if (kids) {
  //                 params.push('kids=' + kids);
  //               }
  //               if (checkIn) {
  //                 params.push('checkin=' + checkIn);
  //               }
  //               if (duration) {
  //                 params.push('duration=' + duration);
  //               }
  //               if (params.length) {
  //                 url += '?' + params.join('&');
  //               }
  //               let elements = [];
  //               console.log('Available rooms', rooms.length);
  //               if (rooms.length) {
  //                 rooms.forEach((room) => {
  //                   for (let i = 0; i < 3; i++) {
  //                     if (room.rates[i]) {
  //                       let buttons = [];
  //                       let element = {
  //                         'title': room.name,
  //                         'image_url': room.imageUrl,
  //                         'subtitle': (room.rates[i].mealPlan ? room.rates[i].mealPlan : '') + ' ' + room.rates[i].accommodation
  //                       };
  //                       buttons.push(
  //                         websiteButton(room.rates[i].price.toFixed(2) + room.rates[i].currency,
  //                           url + '&roomtype=' + room.code + '&roomrate=' + room.rates[i].hotel_rate_plan_code,
  //                           'tall')
  //                       );
  //                       element.buttons = buttons;
  //                       elements.push(element);
  //                     }
  //                   }
  //                 });
  //               }
  //               console.log('Pills to be painted', elements.length);
  //               if (elements.length) {
  //                 operations.paginate(elements, JSON.stringify('BOOK_NOW'), null, message, bot, utils.getString(strings, 'AVAILABILITY_PRE', userData), strings, userData, convo);
  //               } else {
  //                 convo.say(utils.getString(strings, 'NO_AVAILABILITY', userData));
  //               }
  //             } else {
  //               convo.say(utils.getString(strings, 'NO_AVAILABILITY', userData));
  //             }
  //             convo.next();
  //           });
  //       };
  //       let askPreselectedDataConfirmation = function (response, convo) {
  //         let text = utils.getString(strings, 'YOUR_BOOKING_DATA', userData);
  //
  //         text += '\u000A---------------------';
  //         if (!adults && !kids && !checkIn && !duration){
  //           text += '\u000A' + utils.getString(strings, 'BOOKING_COMPLETE_DATA', userData);
  //         } else {
  //           text += '\u000A' + utils.getString(strings, 'BOOKING_ROOM', userData);
  //         }
  //         if (adults) {
  //           text += '\u000A' + utils.getString(strings, 'ADULTS', userData) + ': ' + adults;
  //         }
  //
  //         if (kids) {
  //           text += '\u000A' + utils.getString(strings, 'KIDS', userData) + ': ' + kids;
  //         }
  //         if (checkIn && duration) {
  //           text += '\u000A' + utils.getString(strings, 'CHECK_IN', userData) + ': ' + checkIn;
  //           text += '\u000A' + utils.getString(strings, 'NIGHTS', userData) + ': ' + duration;
  //         }
  //         // text += "\u000A\u000A" + utils.getString(strings, "IS_THIS_CORRECT",userData);
  //         if (entities.indexOf && entities.indexOf('rooms_count') !== -1) {
  //           params.push('rooms=' + message.entities['rooms_count'][0].value);
  //         }
  //         if (adults) {
  //           params.push('adults=' + adults);
  //         }
  //         if (kids) {
  //           params.push('kids=' + kids);
  //         }
  //         if (checkIn) {
  //           params.push('checkin=' + checkIn);
  //         }
  //         if (duration) {
  //           params.push('duration=' + duration);
  //         }
  //         if (params.length) {
  //           url += '?' + params.join('&');
  //         }
  //         let attachment = {
  //           'type': 'template',
  //           'payload': {
  //             'template_type': 'button',
  //             text: text,
  //             'buttons': [
  //               websiteButton(utils.getString(strings, 'BOOK_NOW', userData),
  //                 url,
  //                 'tall')
  //             ]
  //           }
  //         };
  //         convo.say({attachment: attachment});
  //       };
  //       let askDuration = function (response, convo) {
  //         let quickReplies = [];
  //         for (let i = 1; i <= 10; i++) {
  //           quickReplies.push({
  //             'content_type': 'text',
  //             'title': i,
  //             'payload': i
  //           });
  //         }
  //         quickReplies.push({
  //           'content_type': 'text',
  //           'title': utils.getString(strings, 'OTHER', userData),
  //           'payload': 'other'
  //         });
  //         convo.ask({
  //           text: utils.getString(strings, 'HOW_MANY_NIGHTS', userData),
  //           quick_replies: quickReplies
  //         }, function (response, convo) {
  //           if (response.quick_reply && response.quick_reply.payload) {
  //             if (response.quick_reply.payload === 'other') {
  //               askPreselectedDataConfirmation(null, convo);
  //               convo.next();
  //             } else {
  //               duration = parseInt(response.quick_reply.payload, 10);
  //               if (kids) {
  //                 askPreselectedDataConfirmation(null, convo);
  //                 convo.next();
  //               } else {
  //                 getAvailability(null, convo);
  //               }
  //             }
  //           } else {
  //             convo.repeat();
  //           }
  //         });
  //       };
  //       let askCheckIn = function (message, convo) {
  //         prevDays = [];
  //         for (let i = 0; i < 10; i++) {
  //           let today = new Date();
  //           today.setDate(today.getDate() + i);
  //           let fecha = new moment(today);
  //           prevDays.push({
  //             'content_type': 'text',
  //             'title': fecha.format('DD MMMM YYYY'),
  //             'payload': fecha.format('YYYY-MM-DD')
  //           });
  //         }
  //         prevDays.push({
  //           'content_type': 'text',
  //           'title': utils.getString(strings, 'OTHER', userData),
  //           'payload': 'other'
  //         });
  //         convo.ask({
  //           text: utils.getString(strings, 'BOOKING_CHECKIN', userData),
  //           quick_replies: prevDays,
  //         }, function (response, convo) {
  //           if (response.quick_reply) {
  //             if (response.quick_reply.payload === 'other') {
  //               askPreselectedDataConfirmation(null, convo);
  //               convo.next();
  //             } else {
  //               checkIn = response.quick_reply.payload;
  //               if (!duration) {
  //                 askDuration(response, convo);
  //                 convo.next();
  //               } else {
  //                 getAvailability(null, convo);
  //               }
  //             }
  //           } else {
  //             convo.repeat();
  //             convo.next();
  //           }
  //         });
  //       };
  //       let askPax = function (message, convo) {
  //         convo.ask({
  //           text: utils.getString(strings, 'BOOKING_PAX', userData),
  //           quick_replies: [{
  //             'content_type': 'text',
  //             'title': 1 + ' ' + utils.getString(strings, 'ADULT', userData),
  //             'payload': '1:0'
  //           }, {
  //             'content_type': 'text',
  //             'title': 2 + ' ' + utils.getString(strings, 'ADULTS', userData),
  //             'payload': '2:0'
  //           }, {
  //             'content_type': 'text',
  //             'title': 2 + ' ' + utils.getString(strings, 'ADULTS', userData) + ', ' + 1 + ' ' + utils.getString(strings, 'KID', userData),
  //             'payload': '2:1'
  //           }, {
  //             'content_type': 'text',
  //             'title': 2 + ' ' + utils.getString(strings, 'ADULTS', userData) + ', ' + 2 + ' ' + utils.getString(strings, 'KIDS', userData),
  //             'payload': '2:2'
  //           }, {
  //             'content_type': 'text',
  //             'title': utils.getString(strings, 'OTHER', userData),
  //             'payload': 'other'
  //           }],
  //         }, function (response, convo) {
  //           if (response.quick_reply) {
  //             if (response.quick_reply.payload === 'other') {
  //               askPreselectedDataConfirmation(null, convo);
  //             } else {
  //               adults = parseInt(response.quick_reply.payload.split(':')[0], 10);
  //               kids = parseInt(response.quick_reply.payload.split(':')[1], 10);
  //               if (!checkIn) {
  //                 askCheckIn(response, convo);
  //               } else if (!duration) {
  //                 askDuration(response, convo);
  //               } else {
  //                 askPreselectedDataConfirmation(response, convo);
  //               }
  //             }
  //             convo.next();
  //           } else {
  //             convo.repeat();
  //             convo.next();
  //           }
  //         });
  //       };
  //
  //       bot.startConversation(message, function (err, convo) {
  //         if (adults && !checkIn) {
  //           askCheckIn(null, convo);
  //         } else if (!adults) {
  //           askPax(null, convo);
  //         } else if (adults && checkIn && !duration) {
  //           askDuration(null, convo);
  //         } else if (adults && checkIn && duration) {
  //           if (kids) {
  //             askPreselectedDataConfirmation(null, convo);
  //           } else {
  //             getAvailability(null, convo);
  //           }
  //         }
  //       });
  //
  //     });
  //   });
  // }

};

module.exports = startSurvey;