const VoiceResponse = require('twilio').twiml.VoiceResponse;
let config = {voice:'alice', language:'es-ES'};
exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 3
  });

  gather.say("Hola, esto es una encuesta ¿cómo te tomarías ahora aun café, con o sin leche?",config);

  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
