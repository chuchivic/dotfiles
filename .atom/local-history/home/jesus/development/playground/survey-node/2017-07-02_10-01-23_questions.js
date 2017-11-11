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
  askbrand: {

              custom:{
                  next_endpoint:'askyears',
                  next_text: survey.askYears
              }
            },
  askyears: {
              custom:{
                  next_endpoint:'askfuture',
                  next_text: survey.askFuture
              }
            },
  askfuture: {
              si:{
                  next_endpoint:'askfuturebrand',
                  next_text: survey.askFutureBrand
              },
              no:{
                 next_endpoint:'askcountry',
                 next_text:survey.askCountry
              }
            },
  askfuturebrand:{
              custom:{
                  next_endpoint:'askgas',
                  next_text: survey.askGas
              },
  askgas:{
              custom:{
                  next_endpoint:'askstudy',
                  next_text: survey.askStudy
              },

         },
  askstudy:{//TODO //Si pregunta en qué consiste el estudio, contarle alguna movida
              custom:{
                  next_endpoint:'askcountry',
                  next_text: survey.askCountry
              }
          }
  }




};
