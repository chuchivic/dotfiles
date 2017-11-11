'use strict';
const Router = require('express').Router;
const {welcome, repeat} = require('./handler');
const router = new Router();

router.post('/welcome'), (req, res) => {
  res.send(welcome());

});

router.post('/repeat'), (req,res) => {
  console.log('Texto recibido; ');
  console.log(res.body);
  //TODO enviar a repeat el texto que recibamos
  return res.send(repeat());
}
