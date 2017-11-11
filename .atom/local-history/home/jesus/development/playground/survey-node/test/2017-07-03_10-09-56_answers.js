const parseString = require('xml2js').parseString;
const config = require('../config');
const {welcome, answer} = require('../routes/handler');
var assert = require('assert');

describe('Control correct ask',function(){
  describe('come from welcome(have a car) and going to ask for brand when answed is OK', function () {
    it('Should ask for the brand', function (done) {
        answer('welcome','haveacar','si',function(twimlResponse){
          parseString(twimlResponse,function (err, result){
            let action = result.Response.Gather[0].$.action;
            assert.equal('/question?action=askbrand&comeFrom=welcome',action);
            done();
          });
        });
    });
  });
  describe('Come from welcome, and going to ask welcome again when answed is KO', function () {
    it('Should ask for having a car again', function (done) {
        answer('welcome','haveacar','s',function(audio){
          parseString(twimlResponse, function(err, result){
            let action = result.Response.Gather[0].$.action;
            console.log(action);
            assert.equal('/question?action=welcome&comeFrom=welcome',action);
            done();
          });
        });
    });
  });
});
