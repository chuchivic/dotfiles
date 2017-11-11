const {welcome, haveacar, brand, future} = require('./handler');

describe('answer',function(){
  describe('haveacar', function () {
    it('Should ask for a future buy of a car', function (done) {
        haveacar('no',function(audio){

          console.log(audio);
          done();

        });
      // body...
    });
    // body...
  });
});
