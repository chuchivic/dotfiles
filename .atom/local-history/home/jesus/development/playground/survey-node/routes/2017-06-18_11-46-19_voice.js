var VoiceResponse = require('twilio').twiml.VoiceResponse;
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
exports.status = function(request,response){
  console.log("Status call");
  console.log(request.body);

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
