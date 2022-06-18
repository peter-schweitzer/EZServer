const { Endpoints } = require('./Endpoints');
const { REST } = require('./REST');

/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

/**
 * @typedef {Object.<string, resFunction>} resolvers
 */

module.exports = { Endpoints, REST };

