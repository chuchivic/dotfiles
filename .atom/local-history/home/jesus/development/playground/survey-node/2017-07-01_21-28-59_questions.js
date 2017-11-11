var survey = require('./survey_data');
module.exports = {
  haveacar: {
        si:{
            next_endpoint:'askbrand',
            next_text:survey.askBrand
        },
        no:{
            next_endpoint:'askFuture',
            next_text: survey.askFuture
        }
      }
};
