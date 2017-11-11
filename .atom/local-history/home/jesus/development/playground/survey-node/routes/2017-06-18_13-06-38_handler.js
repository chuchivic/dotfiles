const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

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
    action: '/answer/haveacar',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
  audio.getAudioPath("Hola. Le llamamos de Kantar, empresa líder mundial en estudios estadísticos. " +
  "Estamos realizando un rápido sondeo aleatorio sobre automóviles, sólo le molestaremos un par de minutos." +
  "¿Tiene usted coche?",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
};

exports.haveacar= function haveacar(userAnswer, callback){
  //TODO en función de la respuesta preguntar una cosa u otra
  const optionActions = {
    'yes': askBrand,
    'no': askFuture,
  };
  return optionActions[userAnswer]();

  const twiml = new VoiceResponse();
  audio.getAudioPath(userAnswer,function(data){
    twiml.play(data);
    callback(twiml.toString());
  });
};

function askBrand(){

};

function askFuture(){

};
