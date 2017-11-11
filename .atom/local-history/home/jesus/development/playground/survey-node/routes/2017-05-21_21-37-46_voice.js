var VoiceResponse = require('twilio').twiml.VoiceResponse;
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');

// Main interview loop
exports.interview = function(request, response) {
    var phone = request.body.From;
    var input = request.body.RecordingUrl || request.body.Digits;
    var twiml = new VoiceResponse();

    // helper to append a new "Say" verb with alice voice
    function say(text) {
        twiml.say({ voice: 'alice', languaje:'es'}, text);
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
            say('Terribly sorry, but an error has occurred. Goodbye.');
            return respond();
        }

        // If question is null, we're done!
        if (!question) {
            say('Thank you for taking this survey. Goodbye!');
            return respond();
        }

        // Add a greeting if this is the first question
        if (questionIndex === 0) {
            say('Esto es una encuesta, gracias por responder, escucha atentamente las siguientes preguntas');
        }

        // Otherwise, ask the next question
        say(question.text);

        // Depending on the type of question, we either need to get input via
        // DTMF tones or recorded speech
        if (question.type === 'text') {
            say('Por favor, graba tu respuesta después de la señal. Pulsa una tecla para continuar.');
            twiml.record({
                transcribe: true,
                transcribeCallback: '/voice/' + surveyResponse._id
                    + '/transcribe/' + questionIndex,
                maxLength: 60
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

// Transcripton callback - called by Twilio with transcript of recording
// Will update survey response outside the interview call flow
exports.transcription = function(request, response) {
    var responseId = request.params.responseId;
    var questionIndex = request.params.questionIndex;
    var transcript = request.body.TranscriptionText;

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
};
