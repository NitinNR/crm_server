const { Client,Pool } = require('pg');
const App = require('../models/app.model.js');

const getDbConfigs = (adminId) => {


  return new Promise((resolve, reject) => {
    App.DbConfigs(adminId, async (ack, data) => {
      if (ack) {
        console.log('>>>>>> Using PRIVATE DB <<<<<<<<');

        data = data[0].configs;
        const dbconfigs = {
          user: data.USER,
          host: data.HOST,
          database: data.DATABASE,
          password: data.PASSWORD,
          port: data.PORT
        }
        const client = await App.getClientWithCredentials(dbconfigs)
        return resolve(client)
      } else {
        console.log('>>>>>> Using LSPACE DB <<<<<<<<');
        const client = await App.getClientWithCredentials({})
        return resolve(client)
      }
    });
  });
};



module.exports = {getDbConfigs};
