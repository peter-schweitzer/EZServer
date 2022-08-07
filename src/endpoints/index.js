const { Endpoints } = require('./Endpoints');
const { REST } = require('./REST');

module.exports = { Endpoints, REST };

/**
 * @callback resFunction
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */

/** @typedef {Object.<string, resFunction>} resolvers */

