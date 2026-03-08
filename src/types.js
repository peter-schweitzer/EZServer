/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./Params').Params} Params
 */

/**
 * @typedef {"GET"|"HEAD"|"POST"|"PUT"|"DELETE"|"CONNECT"|"OPTIONS"|"TRACE"|"PATCH"} Methods
 * @typedef {IncomingMessage & {url: string, method: string, uri: string}} EZIncomingMessage
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} ResFunction
 */

/**
 * @typedef {LUT<string> & {"*"?: string[]}} RouteLUT
 * @typedef {{handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>) => Err?}} AppMiddleware
 * @typedef {{handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>, route: RouteLUT) => Promise<void|string>}} Middleware
 * @typedef {{use: (middleware: Middleware) => MiddlewareCurry}} MiddlewareCurry
 */

/**
 * @typedef {{fn:  ResFunction, middleware: FalseOr<Middleware[]>}} ResolverLeaf
 *
 * @typedef {LUT<{fn?: ResolverLeaf, rest?: {[method in Methods]?: ResolverLeaf}}>} ResolverLUT
 *
 * @typedef {ResolverLeaf & {params: [number, string][]}} TreeLeaf
 * @typedef {{rest?: {[x in Methods]?: TreeLeaf}, fn?: TreeLeaf}} TreeTwig
 * @typedef {{route?: LUT<TreeNode>, param?: TreeNode, twig?: TreeTwig}} TreeNode
 *
 * @typedef {{fn: ResolverLeaf, params: [number, string][]}} WildcardLeaf
 * @typedef {{route?: LUT<WildcardTreeNode>, param?: WildcardTreeNode, leaf?: WildcardLeaf}} WildcardTreeNode
 * @typedef {{depth: number, root: WildcardTreeNode}} ResolverTreeContainer
 */
