const VoiceResponse = require('twilio').twiml.VoiceResponse;
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs');
let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
})
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

  gather.say("Hola, esto es una encuesta ¿cómo te tomarías ahora aun café, con o sin leche?",config);
  gather.play()

  return voiceResponse.toString();
};

exports.repeat = function repeat(userAnswer){
  const twiml = new VoiceResponse();
  twiml.say(userAnswer,config);
  return twiml.toString();

};
