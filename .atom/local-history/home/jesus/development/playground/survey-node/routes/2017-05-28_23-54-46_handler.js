const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES'
  });

  gather.say("Hola, esto es una encuesta ¿cómo te tomarías ahora aun café, con o sin leche?",{voice:'alice', language:'es-ES'});

  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){

  const twiml = new VoiceResponse();
  twiml.say(userAnswer);
  return twiml.toString;

};
