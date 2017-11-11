const config = require('../config');
const {welcome, haveacar, brand, future} = require('../routes/handler');

describe('answer',function(){
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        haveacar('haveacar','no',function(audio){

          done();

        });
      // body...
    });
    // body...
  });
});
