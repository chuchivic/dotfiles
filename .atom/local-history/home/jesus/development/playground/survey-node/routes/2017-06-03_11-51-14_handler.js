const VoiceResponse = require('twilio').twiml.VoiceResponse;
let config = {voice:'alice', language:'es-ES'};
exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });
//TODO aquí meter una grabación de IBM Watson, y una caché intermedia para reutilizar los ficheros generados

  gather.play('output.wav')

  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
