const { Client } = require('pg');

async function getClientWithCredentials(customConfig) {
    try {

        const client = new Client(customConfig)
        await client.connect()
        return client
        
    } catch (error) {
        console.log("eeeee",error);
        
    }
   
  }

exports.getClientWithCredentials = getClientWithCredentials;