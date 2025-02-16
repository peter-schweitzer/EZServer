/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('./Params').Params} Params
 */

/**
 * @typedef {"GET"|"HEAD"|"POST"|"PUT"|"DELETE"|"CONNECT"|"OPTIONS"|"TRACE"|"PATCH"} Methods
 * @typedef {IncomingMessage & {uri: string}} EZIncomingMessage
 * @typedef {(req: EZIncomingMessage, res: ServerResponse, params: Params) => void} ResFunction
 */

/**
 * @typedef {{handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>) => Err?}} AppMiddleware
 * @typedef {{handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>, route: LUT<string> & {"*"?: string[]}) => Promise<void|string>}} Middleware
 * @typedef {{use: (middleware: Middleware) => MiddlewareCurry}} MiddlewareCurry
 */

/**
 * @typedef {{fn:  ResFunction, middleware: FalseOr<Middleware[]>}} ResolverLeaf
 * @typedef {LUT<{fn?: ResolverLeaf, rest?: {[method in Methods]?: ResolverLeaf}}>} ResolverLUT
 * @typedef {{fn: ResolverLeaf, params: [number, string][]}} WildcardLeaf
 * @typedef {{route?: LUT<WildcardTreeNode>, param?: WildcardTreeNode, leaf?: WildcardLeaf}} WildcardTreeNode
 * @typedef {{depth: number, root: WildcardTreeNode}} ResolverTreeContainer
 */
/**
 * @template {boolean} P
 * @typedef {ResolverLeaf & (P extends true ? {has_params: true, params: [number, string][]} : {has_params: false})} TreeLeaf<P>
 */
/**
 * @template {boolean} P
 * @typedef {{rest?: {[x in Methods]?: TreeLeaf<P>}, fn?: TreeLeaf<P>}} TreeTwig<P>
 */
/**
 * @template {boolean} P
 * @typedef {{route?: LUT<TreeNode<P>>, param?: TreeNode<true>, twig?: TreeTwig<P>}} TreeNode<P>
 */
