const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES'
  });

  gather.say("Hola, dime algo bonito, guapetón",{voice:'alice', language:'es-ES'});

  return voiceResponse.toString();
};

exports.repeat = function repeat(){

  const twiml = new VoiceResponse();
  twiml.say("respuesta");

};
