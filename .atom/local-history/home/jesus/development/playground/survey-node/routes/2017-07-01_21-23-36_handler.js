const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var survey = require('../survey_data');
var questions = require('../questions');

var audio = require('./audio.js')({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b',
  voiceType : 'es-ES_EnriqueVoice'
  //voiceType : 'es-ES_LauraVoice'
  //voiceType : 'es-LA_SofiaVoice'
  //voiceType : 'es-US_SofiaVoice'
});

exports.welcome = function welcome(callback) {
const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/question?action=haveacar',
    input: 'speech',
    method : 'GET',
    language : 'es-ES',
    timeout:3
  });

  audio.getAudioPath(survey.welcome,function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
};


exports.answer = function answer(action, userAnswer, callback){
  console.log('The user answer is :' + userAnswer);
  //TODO en función de la respuesta preguntar una cosa u otra
  //TODO si no hay respuesta repetir la pregunta
  console.log(questions.action.si);
  console.log(questions.action.userAnswer.next_endpoint);
  /*const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/answer/future',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 1
  });
  audio.getAudioPath(questions[action,userAnswer],function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });*/

};
