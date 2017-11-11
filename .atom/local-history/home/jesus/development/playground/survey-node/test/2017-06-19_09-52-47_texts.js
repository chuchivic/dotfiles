var survey = require('../survey_data');
describe('texts',function() {
  it('Access to text properly',function(done) {
      let welcome = survey.questions.welcome;
      console.log(welcome);
  })
});
