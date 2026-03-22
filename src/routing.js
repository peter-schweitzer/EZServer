import { data, err } from '@peter-schweitzer/ez-utils';

import { RingBuffer, WildcardQueueNode } from './RingBuffer.js';

/**
 * @param {ResolverLUT} lut
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {ResolverLeaf}
 */
function add_ResFunction_without_params(lut, uri, fn) {
  return (lut[uri] = { fn, middleware: false });
}

/**
 * @param {TreeNode} root
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {TreeLeaf}
 */
function add_ResFunction_with_params(root, uri, fn) {
  /** @type {TreeNode} */
  let tree_ptr = root;
  /** @type {[number, string][]} */
  const params = [];

  const parts = uri.slice(1).split('/');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part[0] === ':') {
      tree_ptr = tree_ptr.param ??= {};
      params.push([i, part.slice(1)]);
    } else tree_ptr = (tree_ptr.route ??= {})[part] ??= {};
  }

  return (tree_ptr.leaf = { fn, middleware: false, params });
}

/**
 * @param {ResolverTreeContainer} tree_container
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {TreeLeaf}
 */
function add_ResFunction_with_wildcard(tree_container, uri, fn) {
  if (uri === '/:*') {
    if (tree_container.depth === 0) tree_container.depth = 1;
    tree_container.root.leaf = { fn, middleware: false, params: [] };
    return tree_container.root.leaf;
  }

  const parts = uri.slice(1, -3).split('/');
  const parts_count = parts.length;
  tree_container.depth = Math.max(tree_container.depth, parts_count);

  /** @type {[number, string][]} */
  const params = [];
  let tree_ptr = tree_container.root;

  for (let i = 0; i < parts_count; i++) {
    const part = parts[i];

    if (part[0] === ':') {
      tree_ptr = tree_ptr.param ??= {};
      params.push([i, part.slice(1)]);
    } else {
      tree_ptr = tree_ptr.route ??= {};
      tree_ptr = tree_ptr[part] ??= {};
    }
  }

  return (tree_ptr.leaf = { fn, middleware: false, params });
}

/**
 * @param {ResolverLUT} lut_without_params
 * @param {TreeNode} tree_with_params
 * @param {ResolverTreeContainer} tree_container_with_wildcard
 * @param {string} uri
 * @param {ResFunction} fn
 * @param {Object} [eo_obj={}]
 * @returns {ErrorOr<ResolverLeaf>}
 */
export function add_endpoint_to_corresponding_lut(lut_without_params, tree_with_params, tree_container_with_wildcard, uri, fn, eo_obj = {}) {
  // wildcard can only be at the end of the uri
  if (uri.includes('/:*/')) return err('invalid wildcard symbol, wildcard can only appear at the end of the uri', eo_obj);

  if (!uri.includes('/:')) return data(add_ResFunction_without_params(lut_without_params, uri, fn), eo_obj);
  else if (!uri.endsWith('/:*')) return data(add_ResFunction_with_params(tree_with_params, uri, fn), eo_obj);
  else return data(add_ResFunction_with_wildcard(tree_container_with_wildcard, uri, fn), eo_obj);
}

/**
 * @param {ResolverLUT} endpoints
 * @param {EZIncomingMessage} req
 * @returns {FalseOr<ResolverLeaf>}
 */
export function get_endpoint(endpoints, { uri }) {
  return endpoints[uri] ?? false;
}

/**
 * @template {{param?: N, route?: LUT<N>}} N
 * @param {{i: number, ptr: N}[]} buff
 * @param {string[]} parts
 * @param {N} node
 * @param {number} i
 */
function push_helper(buff, parts, { param, route }, i) {
  if (param !== undefined) buff.push({ ptr: param, i: i + 1 });
  if (route !== undefined) {
    const ptr = route[parts[i]];
    if (ptr !== undefined) buff.push({ ptr, i: i + 1 });
  }
}

/**
 * @param {TreeNode} endpoints
 * @param {EZIncomingMessage} req
 * @param {LUT<string> & {'*'?: string[]}} route_params
 * @returns {FalseOr<ResolverLeaf>}
 */
export function get_endpoint_with_param(endpoints, { uri, method }, route_params) {
  if (uri === '/') return false;

  const parts = uri.slice(1).split('/');
  /** @type {{i: number, ptr: TreeNode}[]} */
  const buff = [];

  push_helper(buff, parts, endpoints, 0);

  while (buff.length > 0) {
    /** @type {{i: number, ptr: TreeNode}} */
    // @ts-ignore ts(2339) buff is not empty
    const { i, ptr } = buff.pop();

    if (i === parts.length) {
      const leaf = ptr.leaf;
      if (leaf === undefined) continue;

      for (const [idx, name] of leaf.params) route_params[name] = parts[idx];
      return leaf;
    }

    push_helper(buff, parts, ptr, i);
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
  if (n === 0) return false;
  if (uri === '/') return root.leaf ?? false;

  const uri_parts = uri.slice(1).split('/');
  const max_traversal_depth = Math.min(uri_parts.length, n);

  // heuristic approach to minimize memory usage for long URIs:
  //   the longer the URI, the less likely to have multiple possible paths in the ResolverTree.
  /** @type {RingBuffer<WildcardQueueNode<WildcardTreeNode>>} */
  const rbq = new RingBuffer(1 << (max_traversal_depth - (max_traversal_depth > 4 ? (max_traversal_depth - 1) >> 1 : 1)));
  rbq.enqueue(new WildcardQueueNode(0, root));

  let leaf;
  let depth = -1;
  while (rbq.length > 0) {
    /** @type {WildcardQueueNode<WildcardTreeNode>} */
    // @ts-ignore ts(2339) queue is not empty
    const { i, node } = rbq.dequeue();

    if (i > depth) {
      const l = node.leaf;
      if (l !== undefined) {
        leaf = l;
        depth = i;
      }
    }

    const { route, param } = node;

    if (route !== undefined) {
      const route_node = route[uri_parts[i]];
      if (route_node !== undefined) rbq.enqueue(new WildcardQueueNode(i + 1, route_node));
    }

    if (param !== undefined) rbq.enqueue(new WildcardQueueNode(i + 1, param));
  }

  if (leaf === undefined) return false;

  for (const [i, p] of leaf.params) route_params[p] = uri_parts[i];
  route_params['*'] = uri_parts.slice(depth);
  return leaf;
}
