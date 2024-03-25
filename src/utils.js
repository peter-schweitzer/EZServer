//#region imports
import { readFile } from 'node:fs';

import { ERR, LOG, WRN, data, err } from '@peter-schweitzer/ez-utils';

/** @type {LUT<string>} */
import mime_types from '../data/mimeTypes.json' assert { 'type': 'json' };
import { RingBuffer } from './RingBuffer.js';
//#endregion

export const MIME = Object.freeze({ TEXT: 'text/plain;charset=UTF-8', HTML: 'text/html;charset=UTF-8', JSON: 'application/json' });

/**
 * @param {string} uri
 * @param {ResolverLUT} resolvers
 * @returns {FalseOr<ResFunction>}
 */
export function get_ResFunction(uri, resolvers) {
  let path = uri;
  while (true)
    if (Object.hasOwn(resolvers, path)) return resolvers[path];
    else if (path.length === 1) return false;
    else path = path.slice(0, path.lastIndexOf('/') || 1);
}

/**
 * @param {ResolverTree} resolver_tree
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {void}
 */
function add_ResFunction_with_params(resolver_tree, uri, fn) {
  if (uri === '') return;

  /** @type {[string, number][]} */
  const params = [];
  let tree_ptr = resolver_tree;
  const uri_fragments = uri.split('/');
  for (let i = 0; i < uri_fragments.length; ++i) {
    const uri_fragment = uri_fragments[i];
    if (uri_fragment[0] === ':') {
      params.push([uri_fragment.slice(1), i]);
      tree_ptr = Object.hasOwn(tree_ptr, 'param') ? tree_ptr.param : (tree_ptr.param = {});
    } else if (!Object.hasOwn(tree_ptr, 'routes')) tree_ptr = (tree_ptr.routes = { [uri_fragment]: {} })[uri_fragment];
    else tree_ptr = Object.hasOwn(tree_ptr.routes, uri_fragment) ? tree_ptr.routes[uri_fragment] : (tree_ptr.routes[uri_fragment] = {});
  }

  tree_ptr.params = params;
  tree_ptr.fn = fn;
}

/**
 * @param {ResolverTreeContainer} tree_container
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {void}
 */
function add_ResFunction_with_wildcard(tree_container, uri, fn) {
  if (uri === ':*') {
    if (tree_container.depth === 0) tree_container.depth = 1;
    tree_container.root.params = [];
    tree_container.root.fn = fn;
    return;
  }

  tree_container.depth = uri.split('/').length;
  add_ResFunction_with_params(tree_container.root, uri.slice(0, -3), fn);
}

/**
 * @param {ResolverLUT} lut_without_params
 * @param {ResolverTree} lut_with_params
 * @param {ResolverTreeContainer} lut_with_wildcard
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {void}
 */
export function add_endpoint_to_corresponding_lut(lut_without_params, lut_with_params, lut_with_wildcard, uri, fn) {
  if (uri.includes('/:'))
    if (uri.endsWith('/:*')) add_ResFunction_with_wildcard(lut_with_wildcard, uri.slice(1), fn);
    else add_ResFunction_with_params(lut_with_params, uri.slice(1), fn);
  else lut_without_params[uri] = fn;
}

/**
 * @param {string} query_string
 * @param {{}} [query={}]
 * @returns {LUT<string>}
 */
export function set_query_parameters(query_string = '', query = {}) {
  if (!query_string.length) return query;

  for (const kv of query_string.split('&')) {
    const [key, value] = kv.split('=');
    if (!key.length || !value?.length) continue;
    query[key] = value;
  }

  return query;
}

/**
 * @param {string[]} uri_fragments
 * @param {[string, number][]} params
 * @param {LUT<string>} [route={}]
 * @returns {void}
 */
function set_route_parameters(uri_fragments, params, route = {}) {
  for (const param of params) route[param[0]] = uri_fragments[param[1]];
}

/**
 * @param {string[]} uri_fragments
 * @param {number} uri_fragment_idx
 * @param {ResolverTree} tree_ptr
 * @returns {FalseOr<ResolverTree>}
 */
function walk_tree(uri_fragments, uri_fragment_idx, tree_ptr) {
  if (Object.hasOwn(tree_ptr, 'routes') && Object.hasOwn(tree_ptr.routes, uri_fragments[uri_fragment_idx])) tree_ptr = tree_ptr.routes[uri_fragments[uri_fragment_idx]];
  else if (Object.hasOwn(tree_ptr, 'param')) tree_ptr = tree_ptr.param;
  else return false;

  if (++uri_fragment_idx === uri_fragments.length) return tree_ptr;
  else return walk_tree(uri_fragments, uri_fragment_idx, tree_ptr);
}

/**
 * @param {string} uri
 * @param {ResolverTree} tree_root
 * @param {LUT<string>} route_params
 * @returns {FalseOr<ResFunction>}
 */
export function get_ResFunction_with_params(uri, tree_root, route_params) {
  if (uri === '/') return false;

  const uri_fragments = uri.split('/').slice(1);

  let false_or_ptr = walk_tree(uri_fragments, 0, tree_root);
  if (false_or_ptr === false || !Object.hasOwn(false_or_ptr, 'fn') || !Object.hasOwn(false_or_ptr, 'params')) return false;

  set_route_parameters(uri_fragments, false_or_ptr.params, route_params);
  return false_or_ptr.fn;
}

/**
 * @param {string} uri
 * @param {ResolverTreeContainer} tree_container
 * @param {LUT<string> & {'*'?: string[]}} route_params
 * @returns {FalseOr<ResFunction>}
 */
export function get_ResFunction_with_wildcard(uri, { depth: n, root }, route_params) {
  if (uri === '/' || n === 0) return false;

  const uri_fragments = uri.slice(1).split('/');
  const max_traversal_depth = uri_fragments.length < n ? uri_fragments.length : n;

  // heuristic approach to minimize memory usage for long URIs:
  //   the longer the URI, the less likely to have multiple possible paths in the ResolverTree.
  /** @type {RingBuffer<{i: number, node: ResolverTree}>} */
  const rbq = new RingBuffer(2 ** (max_traversal_depth - (max_traversal_depth > 4 ? (max_traversal_depth - 1) >> 1 : 1)));
  rbq.enqueue({ i: 0, node: root });

  /** @type {ResFunction} */
  let fn;
  /** @type {[string, number][]} */
  let params;
  let depth = -1;
  do {
    const { i, node } = rbq.dequeue();

    if (Object.hasOwn(node, 'fn') && Object.hasOwn(node, 'params')) {
      fn = node.fn;
      params = node.params;
      depth = i;
    }

    const uri_fragment = uri_fragments[i];

    if (Object.hasOwn(node, 'param')) rbq.enqueue({ i: i + 1, node: node.param });
    if (Object.hasOwn(node, 'routes') && Object.hasOwn(node.routes, uri_fragment)) rbq.enqueue({ i: i + 1, node: node.routes[uri_fragment] });
  } while (rbq.length > 0);

  if (depth === -1) return false;

  set_route_parameters(uri_fragments, params, route_params);
  route_params['*'] = uri_fragments.slice(depth);
  return fn;
}

//#region utility functions
/**
 * @param {ServerResponse} res response from the server
 * @param {string|Buffer|Uint8Array} [chunk=null] data of the response
 * @param {Object} [options={}] optional options
 * @param {number} [options.code=200] status code of the response
 * @param {string} [options.mime="text/plain;charset=UTF-8"] mime-type of the response
 * todo: add a proper type for headers with all available key value pairs
 * @param {LUT<string|number>} [options.headers={}] additional headers ('Content-Type' is overwritten by mime, default is an empty Object)
 * @returns {void}
 */
export function buildRes(res, chunk = null, { code = 200, mime = MIME.TEXT, headers = {} } = {}) {
  Object.assign(headers, { 'Content-Type': mime });

  if (chunk === null || chunk === '') res.writeHead(code, Object.assign(headers, { 'Content-Length': 0 }));
  else {
    if (!Object.hasOwn(headers, 'Content-Length')) Object.assign(headers, { 'Content-Length': Buffer.byteLength(chunk) });
    res.writeHead(code, headers);
    // FIXME: write() can error, but it takes a callback => no good way to propagate the error to the caller :(
    res.write(chunk);
  }

  res.end();
}

/**
 * @param {EZIncomingMessage} req request from the client
 * @param {ServerResponse} res response from the server
 * @returns {void}
 */
export function throw404(req, res) {
  WRN('404 on', req.url);
  buildRes(res, `<!DOCTYPE html><head><meta charset="UTF-8"><title>404</title></head><body><h1>ERROR</h1><p>404 '${req.uri}' not found.</p></body></html>`, {
    code: 404,
    mime: MIME.HTML,
  });
}

/**
 * @param {string} filePathOrName path, or name of  the file
 * @returns {string} mime-type of the file (default 'text/plain')
 */
function get_type(filePathOrName) {
  const file_ending = filePathOrName.split('.').pop();
  if (Object.hasOwn(mime_types, file_ending)) return mime_types[file_ending];
  WRN(`mime-type for '${file_ending}' not found`);
  return MIME.TEXT;
}

/**
 * @param {ServerResponse} res response from the Server
 * @param {string} filePath path of the file
 * @param {number} statusCode status code df the response (default 200)
 * @returns {void}
 */
export function serveFromFS(res, filePath, statusCode = 200) {
  LOG('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    if (err !== null) buildRes(res, `error while loading file from fs:\n${err}`, { code: 500, mime: MIME.TEXT });
    else buildRes(res, data, { code: statusCode, mime: get_type(filePath) });
  });
}

/**
 * @param {IncomingMessage} req
 * @return {AsyncErrorOr<any>}
 */
export function getBodyJSON(req) {
  return new Promise((resolve, _) => {
    let buff = '';

    req.on('data', (chunk) => (buff += chunk.toString('utf8')));

    req.on('end', () => {
      if (buff.length === 0) resolve(data(''));
      try {
        resolve(data(JSON.parse(buff)));
      } catch (e) {
        ERR('\x1b[32;1m' + 'error in getBodyJSON (JSON.parse):' + '\x1b[0m', e);
        resolve(err(typeof e === 'string' ? e : JSON.parse(e)));
      }
    });

    req.on('error', (e) => {
      ERR("error in getBodyJSON (req.on 'error'):", e);
      resolve(err(typeof e === 'string' ? e : JSON.stringify(e)));
    });
  });
}

/**
 * @param {IncomingMessage} req
 * @return {AsyncErrorOr<string>} - may return empty string
 */
export function getBodyText(req) {
  return new Promise((resolve, _) => {
    let buff = '';

    req.on('data', (chunk) => (buff += chunk.toString('utf8')));

    req.on('end', () => {
      resolve(data(buff));
    });

    req.on('error', (e) => {
      ERR('error in getBodyText:', e);
      resolve(err(typeof e === 'string' ? e : JSON.stringify(e)));
    });
  });
}
//#endregion
