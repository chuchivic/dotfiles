const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var survey = require('../survey_data');
var questions = require('../questions');
const Wit = require('node-wit').Wit;
const wit = new Wit({
  accessToken: config.wit.token
});

var audio = require('./audio.js')({
  username: '5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password: 'Z0iKEZNaNr4b',
  voiceType: 'es-ES_EnriqueVoice'
  //voiceType : 'es-ES_LauraVoice'
  //voiceType : 'es-LA_SofiaVoice'
  //voiceType : 'es-US_SofiaVoice'
});

exports.welcome = function welcome (callback) {
  const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/question?action=haveacar&comeFrom=haveacar',
    input: 'speech',
    method: 'GET',
    language: 'es-ES',
    timeout: 3
  });

  audio.getAudioPath(survey.welcome, function (data) {
    gather.play(data);
    callback(voiceResponse.toString());
  });
};

exports.answer = function answer (comeFrom, action, userAnswer, callback) {
  const voiceResponse = new VoiceResponse();
  wit.message(userAnswer, {}).then((data) => {
    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
    let entities = Object.keys(data.entities);
    console.log("Entity", entities[0]);
    const questionInfo = questions[action][entities[0]];
    let finalAction = null;
    let finalText = null;
    if (questionInfo != undefined) {
      finalAction = questionInfo.next_endpoint;
      finalText = questionInfo.next_text;
    } else {
      //TODO aquí meter el caso de repetir, quizá pasar la pregunta que se le hizo para seguir el proceso
      finalAction = comeFrom;
      finalText = 'No te he entendido muy bien, repite la respuesta, por favor.' + survey[comeFrom];
    }
    const gather = voiceResponse.gather({
      action: '/question?action=' + finalAction + '&comeFrom=' + comeFrom,
      input: 'speech',
      method: 'GET',
      language: 'es-ES',
      timeout: 10
    });
    audio.getAudioPath(finalText, function (data) {
      gather.play(data);
      callback(voiceResponse.toString());
    });
  })


};
