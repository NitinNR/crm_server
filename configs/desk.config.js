const { Client,Pool } = require('pg');
const App = require('../models/app.model.js');

const getDbConfigs = (adminId) => {


  return new Promise((resolve, reject) => {
    App.DbConfigs(adminId, (ack, data) => {
      if (ack) {
        data = data[0].configs;
        const deskConnection = new Pool({
          user: data.USER,
          host: data.HOST,
          database: data.DATABASE,
          password: data.PASSWORD,
          port: data.PORT
        });

        deskConnection.connect((err) => {
          if (err) {
            return reject(err);
          } else {
            console.log('>>>>>> Using Private DB <<<<<<<<');
            return resolve(deskConnection);
          }
        });
      } else {
        console.log('>>>>>> Using LSPACE DB <<<<<<<<');

        const deskConnection = new Pool();
        deskConnection.connect((err) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(deskConnection);
          }
        });        
      }
    });
  });
};



module.exports = {getDbConfigs};
