/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./Params').Params} Params
 *
 * @typedef {IncomingMessage & {uri: string}} EZIncomingMessage
 * @typedef {{err: string, data: null}} Err
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} resFunction
 * @typedef {LUT<resFunction>} resolverLUT
 */

/**
 * @typedef {{[x: string]: T}} LUT<T>
 * @template T
 */

/**
 * @typedef {{err: null, data: T}} Data<T>
 * @template T
 */

/**
 * @typedef {Err|Data<T>} ErrorOr<T>
 * @template T
 */

/**
 * @typedef {Promise<Err|Data<T>>} AsyncErrorOr<T> The Promise should always resolves, never reject!
 * @template T
 */

/**
 * @typedef {false|T} FalseOr<T>
 * @template T
 */
