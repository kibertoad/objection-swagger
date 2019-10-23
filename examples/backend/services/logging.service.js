const bunyan = require('bunyan');
const config = require('config');
const logConfig = config.get('log');

const bunyanLogger = bunyan.createLogger({
  name: 'main',
  level: logConfig.level,
});

module.exports = bunyanLogger;
