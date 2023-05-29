/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./ParamsBuilder').ParamsBuilder} ParamsBuilder
 * @typedef {import('./Params').Params} Params
 *
 * @typedef {IncomingMessage & {uri: string}} EZIncomingMessage
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} ResFunction
 * @typedef {LUT<ResFunction>} ResolverLUT
 *
 * @typedef {{err: string, data: null}} Err
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
 * @typedef {{[x: string]: T}} LUT<T>
 * @template T
 */

/**
 * @typedef {false|T} FalseOr<T>
 * @template T
 */
