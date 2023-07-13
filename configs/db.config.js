require('dotenv').config();

process.env.APP_ENV === "local"?

// localhost
module.exports = {
  HOST: "localhost",
  USER: "tester",
  PASSWORD: "tester@localhost",
  DB: "crm",
  PORT: 3306
}:

module.exports = {
  HOST: process.env.DB_HOST ,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB,
  PORT: process.env.DB_PORT
};

  