const config = require('../config');
const fs = require('fs');
const md5 = require('md5');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
module.exports = function(options){
    let text_to_speech = new TextToSpeechV1({
      username:options.username,
      password:options.password
    });

    const audio = {};

    audio.getAudioPath = function(toSay, callback){
      let fileName = md5(toSay) + '-' + options.voiceType + '.wav';
      let url = config.webhook_url + '/' + fileName;
      if(fs.existsSync('public/' + fileName)){
        console.log("Fichero existe");
        callback(url);
      }else{
        var params = {
          text: toSay,
          voice: options.voiceType,
          accept: 'audio/wav'
        };
        let fsSync = fs.createWriteStream('public/' + fileName);
        let stream = text_to_speech.synthesize(params).pipe(fsSync);
        fsSync.on('close',function(){
            callback(url);
        });
      }
    }

    return audio;
};
