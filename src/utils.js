//#region imports
import { ERR, LOG, WRN, data, err } from '@peter-schweitzer/ez-utils';
import { readFile } from 'node:fs';

/** @type {LUT<string>} */
import mime_types from '../data/mimeTypes.json' assert { 'type': 'json' };
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
 * @param {LUT<any>} resolverTree
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {void}
 */
function add_ResFunction_with_params(resolverTree, uri, fn) {
  const params = [];
  let tree_ptr = resolverTree;
  const uri_fragments = uri.split('/').slice(1);

  for (let i = 0; i < uri_fragments.length; i++) {
    const uri_fragment = uri_fragments[i];
    if (uri_fragment[0] === ':') {
      params.push([uri_fragment.slice(1), i]);
      tree_ptr = Object.hasOwn(tree_ptr, 'param') ? tree_ptr.param : (tree_ptr.param = {});
    } else if (!Object.hasOwn(tree_ptr, 'routes')) tree_ptr = (tree_ptr.routes = { [uri_fragment]: {} })[uri_fragment];
    else tree_ptr = Object.hasOwn(tree_ptr.routes, uri_fragment) ? tree_ptr[uri_fragment] : (tree_ptr[uri_fragment] = {});
  }

  tree_ptr.params = params;
  tree_ptr.fn = fn;
}

/**
 * @param {string[]} uri_fragments
 * @param {number} uri_fragment_idx
 * @param {LUT<any>} tree_ptr
 * @returns {FalseOr<LUT<any>>}
 */
function walk_routes(uri_fragments, uri_fragment_idx, tree_ptr) {
  if (!Object.hasOwn(tree_ptr, 'routes') || !Object.hasOwn(tree_ptr.routes, uri_fragments[uri_fragment_idx])) return false;

  tree_ptr = tree_ptr.routes[uri_fragments[uri_fragment_idx]];

  if (++uri_fragment_idx === uri_fragments.length) return tree_ptr;
  else return walk_routes(uri_fragments, uri_fragment_idx, tree_ptr) || walk_param(uri_fragments, uri_fragment_idx, tree_ptr);
}

/**
 * @param {string[]} uri_fragments
 * @param {number} uri_fragment_idx
 * @param {LUT<any>} tree_ptr
 * @returns {FalseOr<LUT<any>>}
 */
function walk_param(uri_fragments, uri_fragment_idx, tree_ptr) {
  if (!Object.hasOwn(tree_ptr, 'param')) return false;

  tree_ptr = tree_ptr.param;

  if (++uri_fragment_idx === uri_fragments.length) return tree_ptr;
  else return walk_routes(uri_fragments, uri_fragment_idx, tree_ptr) || walk_param(uri_fragments, uri_fragment_idx, tree_ptr);
}

/**
 * @param {string} uri
 * @param {LUT<any>} tree_root
 * @param {LUT<string>} route_params
 * @returns {FalseOr<ResFunction>}
 */
export function get_ResFunction_with_params(uri, tree_root, route_params) {
  if (uri === '/') return false;

  const uri_fragments = uri.split('/').slice(1);

  let false_or_ptr = walk_routes(uri_fragments, 0, tree_root) || walk_param(uri_fragments, 0, tree_root);
  if (false_or_ptr === false || !Object.hasOwn(false_or_ptr, 'fn') || !Object.hasOwn(false_or_ptr, 'params')) return false;

  set_route_parameters(uri_fragments, false_or_ptr.params, route_params);
  return false_or_ptr.fn;
}

/**
 * @param {ResolverLUT} lut_without_params
 * @param {ResolverLUT} lut_with_params
 * @param {string} uri
 * @param {ResFunction} fn
 * @returns {void}
 */
export function add_endpoint_with_or_without_params(lut_without_params, lut_with_params, uri, fn) {
  if (uri.includes('/:')) add_ResFunction_with_params(lut_with_params, uri, fn);
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
 * @param {{}} [route={}]
 * @returns {void}
 */
export function set_route_parameters(uri_fragments, params, route = {}) {
  for (const param of params) route[param[0]] = uri_fragments[param[1]];
}

/**
 * @param {ServerResponse} res response from the server
 * @param {any} [chunk] data of the response
 * @param {Object} [options] optional options
 * @param {number} [options.code] status code of the response (default is 200)
 * @param {string} [options.mime] mime-type of the response (default is 'text/plain')
 * todo: add a proper type for headers with all available key value pairs
 * @param {LUT<string|number>} [options.headers] additional headers ('Content-Type' is overwritten by mime, default is an empty Object)
 * @returns {void}
 */
export function buildRes(res, chunk = null, { code = 200, mime = MIME.TEXT, headers = {} } = {}) {
  Object.assign(headers, { 'Content-Type': mime });
  res.writeHead(code, headers);
  // FIXME: write() can error, but it takes a callback => no good way to propagate the error to the caller :(
  if (chunk !== null && chunk !== '') res.write(chunk);
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
function getType(filePathOrName) {
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
    if (err !== null) buildRes(res, `error while loading file from fs:\n${err}`, { code: 500, mime: 'text/plain' });
    else buildRes(res, data, { code: statusCode, mime: getType(filePath) });
  });
}

/**
 * @param {IncomingMessage} req
 * @return {AsyncErrorOr<any>}
 */
export function getBodyJSON(req) {
  return new Promise((resolve, _) => {
    let buff = '';

    req.on('data', (chunk) => (buff += chunk));

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
