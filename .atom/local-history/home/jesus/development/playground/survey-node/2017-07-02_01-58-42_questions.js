var survey = require('./survey_data');
module.exports = {
  haveacar: {
              si:{
                  next_endpoint:'askBrand',
                  next_text:survey.askBrand
              },
              no:{
                  next_endpoint:'askFuture',
                  next_text: survey.askFuture
              }
          },
  askBrand: {
    
              answered:{
                  next_endpoint:'askYears',
                  next_text: survey.askYears
              }
            },
  askYears: {
              answered:{
                  next_endpoint:'askFuture',
                  next_text: survey.askFuture
              }
            },
  askFuture: {
              si:{
                  next_endpoint:'askFutureBrand',
                  next_text: survey.askFutureBrand
              },
              no:{
                 next_endpoint:'askCountry',
                 next_text:survey.askCountry
              }
            },
  askFutureBrand:{
              answered:{
                  next_endpoint:'askGas',
                  next_text: survey.askGas
              },
  askGas:{
              answered:{
                  next_endpoint:'askStudy',
                  next_text: survey.askStudy
              },

         },
  askStudy:{
              answered:{
                  next_endpoint:'askCountry',
                  next_text: survey.askCountry
              }
          }
  }




};
