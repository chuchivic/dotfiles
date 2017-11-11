const VoiceResponse = require('twilio').twiml.VoiceResponse;
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs');
var webhook_url = 'https://b1dd7762.ngrok.io';
/*let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
});
var params = {
  text: 'Hola, Jesús, estoy muy contento de poder ayudarte y guiarte en esta movida',
  voice: 'es-ES_EnriqueVoice', // Optional voice
  accept: 'audio/wav'
};*/
//text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));
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

console.log(gather.toString());
let url = webhook_url + "/output.wav";
  gather.play(url);
  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
