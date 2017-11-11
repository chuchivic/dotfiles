const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const fs = require('fs');
const webhook_url = 'https://b1dd7762.ngrok.io';
let md5 = require('md5');
let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
});
var audio = {
    getAudioPath:function(toSay, callback){
      let fileName = md5(toSay) + '.wav';
      var params = {
        text: toSay,
        voice: 'es-ES_EnriqueVoice', // Optional voice
        accept: 'audio/wav'
      };
      let fsSync = fs.createWriteStream('../public/' + fileName);
      let stream = text_to_speech.synthesize(params).pipe(fsSync);
      fsSync.on('close',function(){
          console.log('Fichero creado');
          let url = webhook_url + '/' + fileName +'.wav';
          callback(url);
      });
    }
};

module.exports = audio;
