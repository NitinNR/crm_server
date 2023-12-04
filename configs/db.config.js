require('dotenv').config();

process.env.APP_ENV === "test"?

// localhost
module.exports = {
  HOST: process.env.DB_HOST ,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_TEST,
  PORT: process.env.DB_PORT
}:

module.exports = {
  HOST: process.env.DB_HOST ,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB,
  PORT: process.env.DB_PORT
};

  