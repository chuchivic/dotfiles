const Router = require('express').Router;
const {welcome, repeat} = require('./handler');
const router = new Router();

router.post('/welcome', (req, res) => {
  welcome(function(audio){
    res.send(audio);
  });
});

router.post('/repeat', (req,res) => {
  console.log('Texto recibido; ');
  let textResponse = req.body.SpeechResult;
  console.log(textResponse);
  //TODO enviar a repeat el texto que recibamos
  // se le puede pasar todo o ya la intención recuperada de wit.ai
  return res.send(repeat(textResponse));
});

module.exports = router;
