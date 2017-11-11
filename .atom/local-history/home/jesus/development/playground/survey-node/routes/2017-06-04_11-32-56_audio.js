const fs = require('fs');
const webhook_url = 'https://b1dd7762.ngrok.io';
const md5 = require('md5');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const voiceType = 'es-ES_EnriqueVoice';
let text_to_speech = new TextToSpeechV1({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b'
});
var audio = {
    getAudioPath:function(toSay, callback){
      let fileName = md5(toSay) + '-' + voiceType + '.wav';
      let url = webhook_url + '/' + fileName;
      if(fs.existsSync('public/' + fileName)){
        console.log("Fichero existe");
        callback(url);
      }else{
        var params = {
          text: toSay,
          voice: voiceType, 
          accept: 'audio/wav'
        };
        let fsSync = fs.createWriteStream('public/' + fileName);
        let stream = text_to_speech.synthesize(params).pipe(fsSync);
        fsSync.on('close',function(){
            callback(url);
        });
      }
    }
};

module.exports = audio;
