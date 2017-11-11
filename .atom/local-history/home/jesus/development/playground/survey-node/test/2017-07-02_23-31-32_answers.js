const config = require('../config');
const {welcome, answer} = require('../routes/handler');

describe('Control correct ask',function(){
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        answer('welcome','haveacar','si',function(twimlResponse){
          //assert.include(twimlResponse,'askbrand','Next question OK');
          console.log(twimlResponse);
          done();

        });
      // body...
    });
    // body...
  });
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        answer('askyears','askfuture','s',function(audio){
          console.log(audio);
          done();

        });
      // body...
    });
    // body...
  });
});
