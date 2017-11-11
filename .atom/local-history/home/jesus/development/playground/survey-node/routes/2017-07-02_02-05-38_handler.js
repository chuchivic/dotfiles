const config = require('../config');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var survey = require('../survey_data');
var questions = require('../questions');

var audio = require('./audio.js')({
  username:'5b0e49ed-cf8e-40be-bb47-8795c3574905',
  password:'Z0iKEZNaNr4b',
  voiceType : 'es-ES_EnriqueVoice'
  //voiceType : 'es-ES_LauraVoice'
  //voiceType : 'es-LA_SofiaVoice'
  //voiceType : 'es-US_SofiaVoice'
});

exports.welcome = function welcome(callback) {
const voiceResponse = new VoiceResponse();
  const gather = voiceResponse.gather({
    action: '/question?action=haveacar',
    input: 'speech',
    method : 'GET',
    language : 'es-ES',
    timeout:3
  });

  audio.getAudioPath(survey.welcome,function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });
};


exports.answer = function answer(action, userAnswer, callback){
  const voiceResponse = new VoiceResponse();
  const questionInfo = questions[action][userAnswer];
  const gather = voiceResponse.gather({
    action: '/question/' + questionInfo.next_endpoint,
    input: 'speech',
    method : 'GET',
    language : 'es-ES',
    timeout: 3
  });
  audio.getAudioPath(questionInfo.next_text,function(data){
      gather.play(data);
      callback(voiceResponse.toString());
  });

};
