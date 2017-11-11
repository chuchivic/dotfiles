const VoiceResponse = require('twilio').twiml.VoiceResponse;
var audio = require('./audio.js');
var webhook_url = 'https://b1dd7762.ngrok.io';
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

exports.repeat = function repeat(callback, userAnswer){
  const twiml = new VoiceResponse();
  twiml.play(audio.getAudioPath(userAnswer,function(data){
    return twiml.toString();
    
  }));
};
