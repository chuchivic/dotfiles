var audio = require('../routes/audio.js');
var md5 = require('md5');
const webhook_url = 'https://b1dd7762.ngrok.io';
var assert = require('assert');
describe('audio',function(){
  describe('getAudioPath',function(){
    it('should save with correct name', function(done){
        var text = 'Hola, bienvenido a la nave del misterio, el misterio de por qué hablo de esta manera tan triste, mi miujer me ha dejado y tengo hemorroides';
        var correctUrl = webhook_url + '/' + md5(text) + md5(audio.voiceType)+ '.wav';
        this.timeout(15000);
        setTimeout(done, 15000);
        audio.getAudioPath(text,function(data){
          console.log('callback OK');
          assert.equal(data,correctUrl);
          done();
        });
    });
  });
});
