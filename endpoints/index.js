const { Endpoints } = require('./Endpoints');
const { REST } = require('./REST');

/**
 * @callback resfunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

/**
 * @typedef {Object.<string, resfunction>} resolvers
 */

module.exports = { Endpoints, REST };

