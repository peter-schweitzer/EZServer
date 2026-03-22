/**
 * imports
 *
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./Params').Params} Params
 *
 * types
 *
 * @typedef {"GET"|"HEAD"|"POST"|"PUT"|"DELETE"|"CONNECT"|"OPTIONS"|"TRACE"|"PATCH"} Methods
 * @typedef {IncomingMessage & {url: string, method: string, uri: string}} EZIncomingMessage
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} ResFunction
 *
 * routing types
 *
 * @typedef {LUT<string> & {"*"?: string[]}} RouteLUT
 * @typedef {{handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>, route: RouteLUT) => Promise<void|string>}} Middleware
 * @typedef {{use: (middleware: Middleware) => MiddlewareCurry}} MiddlewareCurry
 *
 * @typedef {{fn:  ResFunction, middleware: FalseOr<Middleware[]>}} ResolverLeaf
 * @typedef {LUT<ResolverLeaf>} ResolverLUT
 *
 * @typedef {ResolverLeaf & {params: [number, string][]}} TreeLeaf
 * @typedef {{route?: LUT<TreeNode>, param?: TreeNode, leaf?: TreeLeaf}} TreeNode
 *
 * @typedef {{route?: LUT<WildcardTreeNode>, param?: WildcardTreeNode, leaf?: TreeLeaf}} WildcardTreeNode
 * @typedef {{depth: number, root: WildcardTreeNode}} ResolverTreeContainer
 */

/**
 * @template T
 * @template {boolean} [O=false]
 * @typedef {O extends true ? {[method in Methods]?: T} : {[method in Methods]: T}} RestLUT
 */
