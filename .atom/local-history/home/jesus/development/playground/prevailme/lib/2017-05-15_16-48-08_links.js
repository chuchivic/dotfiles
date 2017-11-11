'use strict';
var talk = require('../dictionary/talk.js');
var hear = require('../dictionary/hear.js');
var config = require('../config.js');
var firebaseref = require('firebase');
var myFirebaseRef = firebaseref.database();
var urlPattern = '(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})';
var lan = config.lan;

exports.hearRecover = function(bot, controller) {
//TODO cambiar los textos por variables de lenguaje
  controller.hears('recuperar','direct_message,direct_mention,mention', function(bot, message){

    var askLoadLinks = function(err, convo){
      convo.ask("Parece que quieres recuperar un enlace, dime algún tag para que pueda identificarlo",function (response,convo){

        controller.storage.users.get(response.user, function(err, user) {
            console.log("Entro en la conversación");
              console.log("El tag antes");
              console.log(response.text.trim());

            //Search tags from user input text
            myFirebaseRef.ref('tags').child(response.text.trim()).once('value').then(function(tag){

              console.log("LinkdIds");
              console.log(tag.val().linkId);
              var keys = Object.keys(tag.val().linkId);
              console.log("El linkId:");
              console.log(keys[0]);

            /*  //Search links associated to that tags
              myFirebaseRef.ref('links').child(clave).once('value').then(function(link){
                console.log("El link");
                console.log(link.val().url);
                callback(link.val().url);

                var json = result.val();
                console.log(json);
                var keys = Object.keys(json);
                console.log(keys);
                values = keys.length;*/

                //Print all links
                bot.reply(message, "He encontrado los siguientes enlaces: ");
                
                for(var i = 0; i < keys.length; i++) {
                  myFirebaseRef.ref('links').child(keys[i]).once('value').then(callback,function(link){
                    console.log("El link completo");
                    console.log(link);
                    callback(link);
                  });
                }


              //});
            });
            function callback(result){
              console.log(result.val().url);
              console.log(result.val());
              bot.reply(message, result.val().url);
              convo.stop();
            }


        });
      });
    }
    bot.startConversation(message,askLoadLinks);
  });
}


exports.hearLink = function(bot, controller) {



  controller.hears([urlPattern], 'ambient', function(bot, message) {

      var linkMessage = message.text.substring(1, message.text.length - 1);

      var askStoreLink = function(err, convo) {
        console.log(convo);
          convo.say(talk.dictionary.url_detected[lan]);
          convo.ask(talk.dictionary.ask_save_url[lan],
             [
              {

                  pattern: hear.dictionary.yes[lan],
                  callback: function(response, convo) {
                    askTags(response, convo);
                    convo.next();
                  }
            },
            {
                pattern: hear.dictionary.no[lan],
                callback: function(response, convo) {
                    convo.say(talk.dictionary.nevermind[lan])
                    convo.next();
                }
            },
            {
                default: true,
                callback: function(response, convo) {
                    convo.repeat();
                    convo.next();
                }
            }
            ]);
      }

      var askTags = function (response, convo){
        convo.ask(talk.dictionary.ask_tag[lan],function(response,convo){

          var writtenTags = response.text.split(",");
          controller.storage.users.get(response.user, function(err, user) {
              var jarrayTags = "{";
              writtenTags.forEach(function(tagString){
                jarrayTags += "\""+ tagString +"\":true,";
              });
              jarrayTags = jarrayTags.slice(0,-1) + "}";
              var tags = JSON.parse(jarrayTags);
              var linkData = {
                    user: {
                      id: response.user,
                      name: user.real_name

                    },
                    url: linkMessage,
                    tags,
                    date: new Date().toISOString()
                  };
              var linkKey = myFirebaseRef.ref('links').push().key;

              var linkId = JSON.parse('{"' + linkKey + '":true}');
              var updates = {};
              updates['/links/' + linkKey] = linkData;
              for(var i = 0; i < writtenTags.length; i++){
                        console.log("LinkId a insertar");
                      console.log(linkId);
                      updates['/tags/' + writtenTags[i].trim() + '/linkId/' + linkKey] = true;

              }
              console.log(updates);
              myFirebaseRef.ref().update(updates);

              });
              convo.stop();
          });

          convo.on('end', function(convo) {
            bot.reply(message, talk.dictionary.conv_link_ok[lan]);
          });

      }

      bot.startConversation(message, askStoreLink);

    });
}
