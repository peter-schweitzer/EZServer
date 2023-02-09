/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {Parameters} parameters
 * @returns {void}
 */

/**
 * @typedef {{err: string?, data: T?}} ErrorOr<T>
 * @template T
 */

/**
 * @typedef {T|false} FalseOr<T>
 * @template T
 */

/**
 * @typedef {{[x: string]: T}} LUT<T>
 * @template T
 */

/** @typedef {LUT<resFunction>} resolverLUT */

/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 */
