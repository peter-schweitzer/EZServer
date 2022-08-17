const { Resolvers } = require('./Resolvers');
const { REST } = require('./REST');
const { Endpoints } = require('./Endpoints');

module.exports = { Resolvers, REST, Endpoints };

/**
 * @callback resFunction
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolvers */

