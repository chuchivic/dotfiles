const Router = require('express').Router;
const {welcome,answer} = require('./handler');
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

router.get('/question', (req,res) => {
  console.log(req);
  var action= req.query.action;
  let textResponse = req.body.SpeechResult;
  console.log(textResponse);
  answer(action,textResponse,function(audio){
      res.send(audio);
  });
});

module.exports = router;
