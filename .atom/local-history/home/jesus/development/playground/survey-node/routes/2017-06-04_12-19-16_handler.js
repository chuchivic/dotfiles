const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

var audio = require('./audio.js')({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b',
  voiceType : 'es-ES_EnriqueVoice'
  voiceType : 'es-ES_LauraVoice'
  voiceType : 'es-LA_SofiaVoice'
  voiceType : 'es-US_SofiaVoice'
});


exports.welcome = function welcome(callback) {
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
  audio.getAudioPath("Estoy muy triste, mi mujer me ha dejado y tengo unas hemorroides en carne viva, mátame por favor.",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
};

exports.repeat = function repeat(userAnswer, callback){
  const twiml = new VoiceResponse();
  audio.getAudioPath(userAnswer,function(data){
    twiml.play(data);
    callback(twiml.toString());
  });
};
