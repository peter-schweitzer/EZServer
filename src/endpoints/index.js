const { Endpoints } = require('./Endpoints');
const { REST } = require('./REST');

module.exports = { REST, Endpoints };

/**
 * @callback resFunction
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolvers */

