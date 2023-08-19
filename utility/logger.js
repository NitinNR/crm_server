// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Set the minimum log level to display
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs.log' }), // Log to a file
  ]
});

module.exports = logger;
