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
  audio.getAudioPath("Hola amigo mío, por qué me haces esto, no paro de sufrir, maldito bastardo.",function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();
};