var survey = require('./survey_data');
module.exports = {
  haveacar: {
              si:{
                  next_endpoint:'askbrand',
                  next_text:survey.askbrand
              },
              no:{
                  next_endpoint:'askfuture',
                  next_text: survey.askfuture
              }
          },
  askbrand: {

              custom:{
                  next_endpoint:'askyears',
                  next_text: survey.askyears
              }
            },
  askyears: {
              custom:{
                  next_endpoint:'askfuture',
                  next_text: survey.askfuture
              }
            },
  askfuture: {
              si:{
                  next_endpoint:'askfuturebrand',
                  next_text: survey.askfuturebrand
              },
              no:{
                 next_endpoint:'askcountry',
                 next_text:survey.askcountry
              }
            },
  askfuturebrand:{
              custom:{
                  next_endpoint:'askgas',
                  next_text: survey.askgas
              },
  askgas:{
              custom:{
                  next_endpoint:'askstudy',
                  next_text: survey.askstudy
              },

         },
  askstudy:{//TODO //Si pregunta en qué consiste el estudio, contarle alguna movida
              custom:{
                  next_endpoint:'askcountry',
                  next_text: survey.askcountry
              }
          }
  }




};
