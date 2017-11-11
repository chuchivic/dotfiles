var audio = require('../routes/audio.js');
var md5 = require('md5');
const webhook_url = 'https://b1dd7762.ngrok.io';

describe('audio',function(){
  describe('getAudioPath',function(){
    it('should save with correct name',function(){
      var text = 'Hola, Jesús, me tienes aquí encerrado sin ningún tipo de contemplación, me estás jodiendo la vida, maldito bastardo';
      var audioUrl = audio.getAudioPath(text);
      assert.equal(audioUrl,webhook_url + '/' + md5(text));
    })
  })
})
