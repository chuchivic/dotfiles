const VoiceResponse = require('twilio').twiml.VoiceResponse;
var webhook_url = 'https://b1dd7762.ngrok.io';
exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/repeat',
    input: 'speech',
    method : 'POST',
    language : 'es-ES',
    timeout: 2
  });


    let url = webhook_url + "/output3.wav";
    gather.play(url);
    console.log('Vamos a devolver');
    return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
