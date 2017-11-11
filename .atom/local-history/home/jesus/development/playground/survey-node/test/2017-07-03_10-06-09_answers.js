const parseString = require('xml2js').parseString;
const config = require('../config');
const {welcome, answer} = require('../routes/handler');
var assert = require('assert');

describe('Control correct ask',function(){
  describe('come from welcome(have a car) and going to ask for brand when answed is OK', function () {
    it('Should ask for a future buy of a car', function (done) {
        answer('welcome','haveacar','si',function(twimlResponse){
          parseString(twimlResponse,function (err, result){
            let action = result.Response.Gather[0].$.action;
            assert.equal('/question?action=askbrand&comeFrom=welcome',action);
            done();
          })

        });
      // body...
    });
    // body...
  });
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        answer('welcome','haveacar','s',function(audio){
            let action = result.Response.Gather[0].$.action;
            assert.equal('/question?action=welcome&comeFrom=welcome',action);
            done();

        });
      // body...
    });
    // body...
  });
});
