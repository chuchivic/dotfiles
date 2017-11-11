const Router = require('express').Router;
const {welcome, haveacar} = require('./handler');
const router = new Router();
const Wit = require('node-wit').Wit;
let log = require('node-wit').log;
const WIT_TOKEN = process.env.WIT_TOKEN;
// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  logger: new log.Logger(log.INFO)
});


router.post('/welcome', (req, res) => {
  welcome(function(audio){
    res.send(audio);
  });
});

router.post('/response/haveacar', (req,res) => {
  console.log('Texto recibido');
  let textResponse = req.body.SpeechResult;
  console.log(textResponse);
  //TODO meter wit.ai para reconocer la respuesta

  haveacar(textResponse,function(audio){
      res.send(audio);
  });
});

module.exports = router;
