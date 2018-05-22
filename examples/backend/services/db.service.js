const config = require("config");
const { connectionUtils, heartbeatChecker } = require("knex-utils");

const logger = require("./logging.service");

const dbConfig = config.get("db");
let _knex;

function getKnexInstance() {
  return _knex || _initKnexInstance();
}

function _initKnexInstance() {
  _knex = connectionUtils.getKnexInstance(
    dbConfig,
    connectionUtils.getRegistry(),
    logger
  );
  return _knex;
}

/**
 *
 * @returns {Object} heartbeat check result
 */
function checkHeartBeat() {
  return heartbeatChecker.checkHeartbeat(
    getKnexInstance(),
    dbConfig.heartbeatQuery
  );
}

function close() {
  if (_knex) {
    const promise = _knex.destroy();
    _knex = undefined;
    connectionUtils.getRegistry().length = 0; //ToDo temporary workaround while knex-utils has no better mechanism
    return promise;
  }
  return Promise.resolve();
}

module.exports = {
  getKnexInstance,
  checkHeartBeat,
  close
};
