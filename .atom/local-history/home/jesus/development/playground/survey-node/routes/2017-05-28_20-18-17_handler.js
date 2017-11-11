const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST'
  });

  gather.say("Hola, dime algo bonito, guapetón");

  return voiceResponse.toString();
};

exports.repeat = function repeat(){

  
}