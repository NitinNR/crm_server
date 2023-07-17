const { Pool } = require('pg');

const pool = new Pool({});

async function getClientWithCredentials(customConfig) {
    try {

        const client = await pool.connect(customConfig);
        return client
        
    } catch (error) {
        console.log("eeeee",error);
        
    }
   
  }

exports.getClientWithCredentials = getClientWithCredentials;