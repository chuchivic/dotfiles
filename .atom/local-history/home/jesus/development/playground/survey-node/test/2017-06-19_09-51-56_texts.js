var survey = require('../survey_data');
describe('texts',function() {
  it('Access to text properly',function(done) {
      let welcome = survey[0].welcome;
      console.log(welcome);
  })
});
