const fs = require('fs');
const webhook_url = 'https://b1dd7762.ngrok.io';
const md5 = require('md5');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var audio = function(options){
    let text_to_speech = new TextToSpeechV1({
      username:options.username,
      password:options.password
    });
    
    getAudioPath:function(toSay, callback){
      let fileName = md5(toSay) + '-' + options.voiceType + '.wav';
      let url = webhook_url + '/' + fileName;
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
};

module.exports = audio;
