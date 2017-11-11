const VoiceResponse = require('twilio').twiml.VoiceResponse;
var audio = require('./audio.js');
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

fsSync.on('close',function(){
    console.log('Fichero cerrado');
    let url = webhook_url + "/output3.wav";
    gather.play(url);
    console.log('Vamos a devolver');
    return voiceResponse.toString();
});
var stream = text_to_speech.synthesize(params).pipe(fsSync);

};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
