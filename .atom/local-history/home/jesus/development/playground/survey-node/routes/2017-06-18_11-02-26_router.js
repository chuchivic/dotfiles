const Router = require('express').Router;
const {welcome, repeat} = require('./handler');
const router = new Router();
let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

router.post('/welcome', (req, res) => {
  welcome(function(audio){
    res.send(audio);
  });
});

router.post('/repeat', (req,res) => {
  console.log('Texto recibido');
  let textResponse = req.body.SpeechResult;
  console.log(textResponse);
  //TODO meter wit.ai para reconocer la respuesta
  
  repeat(textResponse,function(audio){
      res.send(audio);
  });
});

module.exports = router;
