import { RingBuffer } from './RingBuffer.js';

/**
 * @param {TreeNode<false>} root
 * @param {string} uri
 * @param {ResFunction} fn
 * @param {Methods} [method=null]
 * @returns {ResolverLeaf}
 */
function add_ResFunction_with_params(root, uri, fn, method = null) {
  /** @type {TreeNode<boolean>} */
  let tree_ptr = root;
  /** @type {[number, string][]} */
  const params = [];

  const parts = uri.slice(1).split('/');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part[0] === ':') {
      if (!Object.hasOwn(tree_ptr, 'param')) tree_ptr.param = {};
      tree_ptr = tree_ptr.param;
      params.push([i, part.slice(1)]);
    } else {
      if (!Object.hasOwn(tree_ptr, 'route')) tree_ptr.route = {};
      if (!Object.hasOwn(tree_ptr.route, part)) tree_ptr.route[part] = {};
      tree_ptr = tree_ptr.route[part];
    }
  }

  if (!Object.hasOwn(tree_ptr, 'twig')) tree_ptr.twig = {};
  const twig = tree_ptr.twig;

  /** @type {TreeLeaf<true>} */
  const leaf = { fn, middleware: false, has_params: true, params };

  if (method === null) twig.fn = leaf;
  else if (!Object.hasOwn(twig, 'rest')) twig.rest = { [method]: leaf };
  else twig.rest[method] = leaf;

  return leaf;
}

/**
 * @param {ResolverTreeContainer} tree_container
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {ResolverLeaf}
 */
function add_ResFunction_with_wildcard(tree_container, uri, fn) {
  if (uri === '/:*') {
    if (tree_container.depth === 0) tree_container.depth = 1;
    tree_container.root.leaf = { fn: { fn, middleware: [] }, params: [] };
    return tree_container.root.leaf.fn;
  }

  const parts = uri.slice(1, -3).split('/');
  if (parts.length > tree_container.depth) tree_container.depth = parts.length;

  /** @type {WildcardTreeNode} */
  let tree_ptr = tree_container.root;
  /** @type {[number, string][]} */
  const params = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part[0] === ':') {
      if (!Object.hasOwn(tree_ptr, 'param')) tree_ptr.param = {};
      tree_ptr = tree_ptr.param;
      params.push([i, part.slice(1)]);
    } else {
      if (!Object.hasOwn(tree_ptr, 'route')) tree_ptr.route = {};
      if (!Object.hasOwn(tree_ptr.route, part)) tree_ptr.route[part] = {};
      tree_ptr = tree_ptr.route[part];
    }
  }

  tree_ptr.leaf = { fn: { fn, middleware: false }, params };
  return tree_ptr.leaf.fn;
}

/**
 * @param {ResolverLUT} lut_without_params
 * @param {TreeNode<false>} tree_with_params
 * @param {ResolverTreeContainer} lut_with_wildcard
 * @param {string} uri
 * @param {ResFunction} fn
 * @param {Methods} method
 * @returns {ResolverLeaf}
 */
export function add_endpoint_to_corresponding_lut(lut_without_params, tree_with_params, lut_with_wildcard, uri, fn, method = null) {
  if (uri.includes('/:'))
    if (uri.includes('/:*/')) return null;
    // cant have wildcard in middle of uri
    else if (uri.endsWith('/:*')) return add_ResFunction_with_wildcard(lut_with_wildcard, uri, fn);
    else return add_ResFunction_with_params(tree_with_params, uri, fn, method);
  else {
    if (!Object.hasOwn(lut_without_params, uri)) lut_without_params[uri] = {};
    const twig = lut_without_params[uri];

    /** @type {ResolverLeaf} */
    const leaf = { fn, middleware: false };

    if (method === null) twig.fn = leaf;
    else if (!Object.hasOwn(twig, 'rest')) twig.rest = { [method]: leaf };
    else twig.rest[method] = leaf;

    return leaf;
  }
}

/**
 * @param {ResolverLUT} endpoints
 * @param {EZIncomingMessage} req
 * @returns {FalseOr<ResolverLeaf>}
 */
export function get_endpoint(endpoints, { uri, method }) {
  if (!Object.hasOwn(endpoints, uri)) return false;

  const leaf = endpoints[uri];
  if (Object.hasOwn(leaf, 'rest') && Object.hasOwn(leaf.rest, method)) return leaf.rest[method];
  else if (Object.hasOwn(leaf, 'fn')) return leaf.fn;
  else return false;
}

/**
 * @param {TreeNode<false>} endpoints
 * @param {EZIncomingMessage} req
 * @param {LUT<string> & {'*'?: string[]}} route_params
 * @returns {FalseOr<ResolverLeaf>}
 */
export function get_endpoint_with_param(endpoints, { uri, method }, route_params) {
  if (uri === '/')
    if (Object.hasOwn(endpoints, 'twig')) return endpoints.twig.fn;
    else return false;

  const parts = uri.slice(1).split('/');
  /** @type {{i: number, ptr: TreeNode<boolean>}[]} */
  const buff = [];

  if (Object.hasOwn(endpoints, 'param')) buff.push({ ptr: endpoints.param, i: 1 });
  if (Object.hasOwn(endpoints, 'route') && Object.hasOwn(endpoints.route, parts[0])) buff.push({ ptr: endpoints.route[parts[0]], i: 1 });

  while (buff.length > 0) {
    const { i, ptr } = buff.pop();

    if (i === parts.length) {
      if (!Object.hasOwn(ptr, 'twig')) continue;
      const twig = ptr.twig;

      /** @type {TreeLeaf<boolean>} */
      let leaf;
      if (Object.hasOwn(twig, 'rest') && Object.hasOwn(twig.rest, method)) leaf = twig.rest[method];
      else if (Object.hasOwn(twig, 'fn')) leaf = twig.fn;
      else continue;

      if (leaf.has_params) for (const [idx, name] of leaf.params) route_params[name] = parts[idx];
      return leaf;
    }

    const next = i + 1;
    if (Object.hasOwn(ptr, 'param')) buff.push({ ptr: ptr.param, i: next });
    if (Object.hasOwn(ptr, 'route') && Object.hasOwn(ptr.route, parts[i])) buff.push({ ptr: ptr.route[parts[i]], i: next });
  }

  return false;
}

/**
 * @param {ResolverTreeContainer} tree_container
 * @param {EZIncomingMessage} req
 * @param {LUT<string> & {'*'?: string[]}} route_params
 * @returns {FalseOr<ResolverLeaf>}
 */
export function get_endpoint_with_wildcard({ depth: n, root }, { uri }, route_params) {
  if (uri === '/' || n === 0) return false;

  const uri_fragments = uri.slice(1).split('/');
  const max_traversal_depth = uri_fragments.length < n ? uri_fragments.length : n;

  // heuristic approach to minimize memory usage for long URIs:
  //   the longer the URI, the less likely to have multiple possible paths in the ResolverTree.
  /** @type {RingBuffer<{i: number, node: WildcardTreeNode}>} */
  const rbq = new RingBuffer(2 ** (max_traversal_depth - (max_traversal_depth > 4 ? (max_traversal_depth - 1) >> 1 : 1)));
  rbq.enqueue({ i: 0, node: root });

  /** @type {ResolverLeaf} */
  let fn;
  /** @type {[number, string][]} */
  let params;
  let depth = -1;
  while (rbq.length > 0) {
    const { i, node } = rbq.dequeue();

    if (Object.hasOwn(node, 'leaf')) {
      fn = node.leaf.fn;
      params = node.leaf.params;
      depth = i;
    }

    const uri_fragment = uri_fragments[i];

    if (Object.hasOwn(node, 'param')) rbq.enqueue({ i: i + 1, node: node.param });
    if (Object.hasOwn(node, 'route') && Object.hasOwn(node.route, uri_fragment)) rbq.enqueue({ i: i + 1, node: node.route[uri_fragment] });
  }

  if (depth === -1) return false;

  for (const [idx, name] of params) route_params[name] = uri_fragments[idx];
  route_params['*'] = uri_fragments.slice(depth);
  return fn;
}
