var VoiceResponse = require('twilio').twiml.VoiceResponse;
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');
const Speech = require('@google-cloud/speech');

//Google Speech API options
const encoding = 'LINEAR16';
const sampleRateHertz = 8000;
const languageCode = 'es-ES';
const speechClient = Speech();
const speechRequest = {
  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  languageCode: languageCode
};


// Main interview loop
exports.interview = function(request, response) {
    var phone = request.body.From;
    var input = request.body.RecordingUrl || request.body.Digits;
    var twiml = new VoiceResponse();

    // helper to append a new "Say" verb with alice voice
    function say(text) {
        twiml.say({ voice: 'alice', language:'es-ES'}, text);
    }

    // respond with the current TwiML content
    function respond() {
        response.type('text/xml');
        response.send(twiml.toString());
    }

    // Find an in-progess survey if one exists, otherwise create one
    SurveyResponse.advanceSurvey({
        phone: phone,
        input: input,
        survey: survey
    }, function(err, surveyResponse, questionIndex) {
        var question = survey[questionIndex];

        if (err || !surveyResponse) {
            say('Ha ocurrido algún error, disculpa la molestias, tenga un buen día.');
            return respond();
        }

        // If question is null, we're done!
        if (!question) {
            say('Gracias por participar en la encuesta. ¡Buen día!');
            return respond();
        }

        // Add a greeting if this is the first question
        if (questionIndex === 0) {
            say('Hola, vamos al lío');
        }

        // Otherwise, ask the next question
        say(question.text);

        // Depending on the type of question, we either need to get input via
        // DTMF tones or recorded speech
        if (question.type === 'text') {
            say('Por favor, graba tu respuesta después de la señal. Pulsa una tecla para continuar.');
              twiml.record({
                recordingStatusCallback: '/voice/' + surveyResponse._id
                    + '/record/' + questionIndex
            });
        } else if (question.type === 'boolean') {
            say('Pulsa uno para "si" y dos para "no".');
            twiml.gather({
                timeout: 10,
                numDigits: 1
            });
        } else {
            // Only other supported type is number
            say('Introduce el número con el teclado de tu teléfono.'
                + ' Para terminar pulsa el asterisco.');
            twiml.gather({
                timeout: 10,
                finishOnKey: '*'
            });
          }

        // render TwiML response
        respond();
    });
};


exports.status = function(request,response){
  var status = request.body.CallStatus;
  console.log(status);

};

// Transcripton callback - called by Twilio with transcript of recording
// Will update survey response outside the interview call flow
exports.recorded = function(request, response) {
    var responseId = request.params.responseId;
    var questionIndex = request.params.questionIndex;
    var recordingUrl = request.body.RecordingUrl;
    var transcript;
    // Detects speech in the audio file
    console.log("Vamos a llamar a Speech API");
    speechClient.recognize(recordingUrl, speechRequest)
        .then((results) => {
          console.log("Parece que ya hemos parseado");
            transcript = results[0];
            console.log(results);
            //TODO la transcripción aquí hay que pasarla por un api.ai o wit.ai
            //para ver las intenciones y en función de eso preguntarle una cosa u otra
            SurveyResponse.findById(responseId, function(err, surveyResponse) {
                if (err || !surveyResponse ||
                    !surveyResponse.responses[questionIndex])
                    return response.status(500).end();

                // Update appropriate answer field
                surveyResponse.responses[questionIndex].answer = transcript;
                surveyResponse.markModified('responses');
                surveyResponse.save(function(err, doc) {
                    return response.status(err ? 500 : 200).end();
                });
            });
         })
        .catch((err) => {
            process.stdout.write("ERROR de speech api");
            console.error('ERROR:', err);
        });

};
