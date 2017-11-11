const config = require('./config');
var audio = require('../routes/audio.js')({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b',
  voiceType: 'es-ES_EnriqueVoice'
});
var voiceType =   'es-ES_EnriqueVoice';
var md5 = require('md5');
var assert = require('assert');
describe('audio',function(){
  describe('getAudioPath',function(){
    it('should save with correct name', function(done){
        var text = 'Hola, bienvenido a la nave del misterio, el misterio de por qué hablo de esta manera tan triste, mi mujer me ha dejado y tengo hemorroides';
        var correctUrl = config.webhook_url + '/' + md5(text) + '-' + voiceType + '.wav';
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
