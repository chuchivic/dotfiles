
var survey = require('survey_data');
module.exports = [
  ['haveacar','si', survey.askBrand]
  ['haveacar','no', survey.askFuture]
];
