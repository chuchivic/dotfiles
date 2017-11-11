const config = require('../config');
const {welcome, answer} = require('../routes/handler');

describe('answer',function(){
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        answer('haveacar','s',function(audio){
          console.log(audio);
          done();

        });
      // body...
    });
    // body...
  });
});
