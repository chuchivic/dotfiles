'use strict';

const config = {
  mongoUri: {
    preproduction: 'mongodb://admin:m0b41l123@ds121581-a0.mlab.com:21581,ds121581-a1.mlab.com:21581/heroku_kxr6b9xw?replicaSet=rs-ds121581',
    production: 'mongodb://admin:m0b41l123@ds121581-a0.mlab.com:21581,ds121581-a1.mlab.com:21581/heroku_kxr6b9xw?replicaSet=rs-ds121581'
  },
  twilio : {
    accountId : 'ACe357aca59cfdedc72dbbc899aa25dcee',
    authToken: '4a5aa5bc922992f7894d9e9c2b0bf420'
  }
};

module.exports = config;