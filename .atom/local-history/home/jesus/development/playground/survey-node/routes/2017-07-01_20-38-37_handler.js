const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var survey = require('../survey_data');

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
//TODO hacer un test de este método, comprobar que devuelve la información correctamente
exports.haveacar = function haveacar(userAnswer, callback){
  console.log('The user answer is :' + userAnswer);
  //TODO en función de la respuesta preguntar una cosa u otra
  const optionActions = {
    'si': hola,
    'no': hola,
  };
  //TODO si no hay respuesta repetir la pregunta
  //TODO no le mola pasado como callback correctamente y si dices no llama directamente a ¿puedes decirme la marca de coche?
  optionActions[userAnswer];
};
function hola(){
  console.log("Soy tortilla");
}




function ask(callback){
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/answer/future',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
  audio.getAudioPath("",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });

}
}