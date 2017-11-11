const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const voiceResponse = new VoiceResponse();

var audio = require('./audio.js')({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b',
  voiceType : 'es-ES_EnriqueVoice'
  //voiceType : 'es-ES_LauraVoice'
  //voiceType : 'es-LA_SofiaVoice'
  //voiceType : 'es-US_SofiaVoice'
});

exports.welcome = function welcome(callback) {
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

exports.haveacar = function haveacar(userAnswer, callback){
  //TODO en función de la respuesta preguntar una cosa u otra
  const optionActions = {
    'si': askBrand,
    'no': askFuture,
  };
  //TODO si no hay respuesta repetir la pregunta
  return optionActions[userAnswer]();
};

exports.brand = function brand(userAnswer, callback){
  //TODO pregunta contestada, almacenar el firebase y siguiente pregunta de la edad
  const optionActions = {
    'si': askBrand,
    'no': askFuture,
  };
  return optionActions[userAnswer]();
};

exports.future = function future(userAnswer, callback){
  //TODO pregunta contestada, almacenar el firebase y siguiente pregunta de la edad
  const optionActions = {
    'si': askBrand,
    'no': askFuture,
  };
  return optionActions[userAnswer]();
};

function askBrand(){
  const gather = voiceResponse.gather({
    action: '/answer/brand',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
  audio.getAudioPath("¿Puede decirme la marca?",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
}

function askFuture(){
  const gather = voiceResponse.gather({
    action: '/answer/future',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
  audio.getAudioPath("¿Cree usted que en los próximos 6 meses se comprará probablemente un coche nuevo?",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });

}
