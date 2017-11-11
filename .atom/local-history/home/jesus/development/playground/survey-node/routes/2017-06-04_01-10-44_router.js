const Router = require('express').Router;
const {welcome, repeat} = require('./handler');
const router = new Router();

router.post('/welcome', (req, res) => {
  welcome(function(audio){
    res.send(audio);
  });
});

router.post('/repeat', (req,res) => {
  console.log('Texto recibido');
  let textResponse = req.body.SpeechResult;
  console.log(textResponse);
  repeat(textResponse,function(audio){
      res.send(audio);
  });
});

module.exports = router;
