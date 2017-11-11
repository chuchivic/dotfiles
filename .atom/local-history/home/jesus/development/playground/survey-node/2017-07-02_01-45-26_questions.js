var survey = require('./survey_data');
module.exports = {
  haveacar: {
              si:{
                  next_endpoint:'askbrand',
                  next_text:survey.askBrand
              },
              no:{
                  next_endpoint:'askfuture',
                  next_text: survey.askFuture
              }
          },
  askBrand: {
              answered:{
                  next_endpoint:'askyears',
                  next_text: survey.askYears
              }
            },
  askYears: {
              answered:{
                  next_endpoint:'askfuture',
                  next_text: survey.askFuture
              }
            },
  askFutureBrand:{
              answered:{
                  next_endpoint:'askgas',
                  next_text: survey.askGas
              },
  askGas            
  }          
            
            
    
  
};
