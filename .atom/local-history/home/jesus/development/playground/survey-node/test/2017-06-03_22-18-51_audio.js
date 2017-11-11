var audio = require('../routes/audio.js');
var md5 = require('md5');
const webhook_url = 'https://b1dd7762.ngrok.io';
var assert = require('assert');
describe('audio',function(){
  describe('getAudioPath',function(){
    it('should save with correct name', function(done){
        var text = 'Hola, Jesús, me tienes aquí encerrado sin ningún tipo de contemplación, me estás jodiendo la vida, maldito bastardo';
        var correctUrl = webhook_url + '/' + md5(text) + '.wav';
        console.log(correctUrl);
        audio.getAudioPath(text,function(done){
        console.log('callback OK');
        assert.equal(done,correctUrl);
        done();
      });
    });
  });
});
