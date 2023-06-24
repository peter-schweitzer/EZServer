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
 */
