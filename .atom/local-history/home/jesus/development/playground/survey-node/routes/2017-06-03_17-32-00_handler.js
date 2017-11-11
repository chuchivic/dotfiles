const VoiceResponse = require('twilio').twiml.VoiceResponse;
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs');
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

let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
});
var params = {
  text: 'Buenas tardes, esto es una encuesta que mola mazo, que va a hacre que se te pongan las pelotas de corbata. Por favor, sácame de aquí, mátame.',
  voice: 'es-ES_EnriqueVoice', // Optional voice
  accept: 'audio/wav'
};

text_to_speech.synthesize(params).pipe(fs.createWriteStream('output2wav'));
let url = webhook_url + "/output2wav";
  gather.play(url);
  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
