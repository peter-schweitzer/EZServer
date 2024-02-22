/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./Params').Params} Params
 *
 * @typedef {IncomingMessage & {uri: string}} EZIncomingMessage
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} ResFunction
 * @typedef {LUT<ResFunction>} ResolverLUT
 * @typedef {"GET"|"HEAD"|"POST"|"PUT"|"DELETE"|"CONNECT"|"OPTIONS"|"TRACE"|"PATCH"} Methods
 *
 * @typedef {{routes?: LUT<ResolverTree>, param?: ResolverTree, fn?: ResFunction, params?: [string, number][]}} ResolverTree
 */
