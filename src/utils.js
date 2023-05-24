import { readFile } from 'node:fs';

/** @type {LUT<string>} */
import mimeTypes from '../data/mimeTypes.json' assert { type: 'json' };

export const { log: LOG, table: TAB, warn: WRN, error: ERR } = console;
export const HTTP_METHODS = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  CONNECT: 'CONNECT',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  PATCH: 'PATCH',
};

/**
 * @param {string} err
 * @returns {Err}
 */
export function err(err) {
  return { err, data: null };
}

/**
 * @param {T} data
 * @returns {Data<T>}
 * @template T
 */
export function data(data) {
  return { err: null, data };
}

/**
 * @param {Promise<T>} promise
 * @returns {AsyncErrorOr<T>}
 * @template T
 */
export async function p2eo(promise) {
  try {
    return data(await promise);
  } catch (e) {
    return err(e);
  }
}

/**
 * @param {EZIncomingMessage} req
 * @param {resolverLUT} resolvers
 * @returns {FalseOr<resFunction>}
 */
export function getResFunction(req, resolvers) {
  let ss = req.uri.split('/');
  for (; ss.length > 1; ss.pop()) {
    let path = ss.join('/');
    if (resolvers.hasOwnProperty(path)) return resolvers[path];
  }
  return resolvers['/'] || false;
}

/**
 * @param {Object.<string, any>} resolverTree
 * @param {string} uri
 * @param {resFunction} fn
 * @returns {void}
 */
function addResFunctionWithParams(resolverTree, uri, fn) {
  const params = [];
  let tmp = resolverTree;
  let current_segment = [];

  const parts = uri.split('/').splice(1);
  for (const part of parts) {
    if (part[0] !== ':' && current_segment.push(part)) continue;
    params.push(part.slice(1));

    if (!!current_segment.length) {
      const segment = current_segment.join('/');
      tmp = tmp.hasOwnProperty('routes') ? tmp.routes : (tmp.routes = {});
      tmp = tmp.hasOwnProperty(segment) ? tmp[segment] : (tmp[segment] = { param: {} });
    }
    current_segment = [];
    tmp = tmp.hasOwnProperty('param') ? tmp.param : (tmp.param = {});
  }

  if (!!current_segment.length) {
    const segment = current_segment.join('/');
    tmp = tmp.hasOwnProperty('routes') ? tmp.routes : (tmp.routes = {});
    tmp = tmp.hasOwnProperty(segment) ? tmp[segment] : (tmp[segment] = {});
  }

  tmp.params = params;
  tmp.fn = fn;
}

/**
 * @param {string} uri
 * @param {LUT<any>} resolverTree
 * @param {ParamsBuilder} params_builder
 * @returns {FalseOr<resFunction>}
 */
export function getResFunctionWithParams(uri, resolverTree, params_builder) {
  if (uri === '/') return false;

  const params = [];
  let tmp = resolverTree;
  let rest = uri.split('/').slice(1); //.slice to remove empty string at the start of the array

  while (true) {
    if (tmp.hasOwnProperty('routes')) {
      const ss = rest;
      for (rest = []; !!ss.length; rest.unshift(ss.pop())) {
        const route = ss.join('/');
        if (tmp.routes.hasOwnProperty(route)) {
          tmp = tmp.routes[route];
          break;
        }
      }
    }

    if (!tmp.hasOwnProperty('param')) break;

    tmp = tmp['param'];
    params.push(rest.shift());
  }

  if (!tmp.hasOwnProperty('fn') || !tmp.hasOwnProperty('params')) return false;

  params_builder.add_route_parameters(tmp.params, params);
  return tmp.fn || false;
}

/**
 * @param {resolverLUT} lut_without_params
 * @param {resolverLUT} lut_with_params
 * @param {string} uri
 * @param {resFunction} fn
 * @returns {void}
 */
export function addEndpointWithOrWithoutParams(lut_without_params, lut_with_params, uri, fn) {
  if (uri.includes('/:')) addResFunctionWithParams(lut_with_params, uri, fn);
  else lut_without_params[uri] = fn;
}

/**
 * @param {ServerResponse} res response from the server
 * @param {any} data data of the response
 * @param {Object} [options] optional options
 * @param {number} [options.code] status code of the response (default is 200)
 * @param {string} [options.mime] mime-type of the response (default is 'text/plain')
 * @param {LUT<string|number>} [options.headers] additional headers ('Content-Type' is overwritten by mime, default is an empty Object)
 * @returns {void}
 */
export function buildRes(res, data = undefined, { code = 200, mime = 'text/plain', headers = {} } = {}) {
  Object.defineProperty(headers, 'Content-Type', { value: mime });
  res.writeHead(code, headers);
  // FIXME: write() can error, but it takes a callback => no good way to propagate the error to the caller :(
  if (data !== undefined) res.write(data);
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
    mime: 'text/html',
  });
}

/**
 * @param {string} filePathOrName path, or name of  the file
 * @returns {string} mime-type of the file (default 'text/plain')
 */
function getType(filePathOrName) {
  const file_ending = filePathOrName.split('.').pop();
  if (mimeTypes.hasOwnProperty(file_ending)) return mimeTypes[file_ending];
  WRN('mime-type not found');
  return 'text/plain';
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
      resolve(!buff.length ? data('') : p2eo(JSON.parse(buff)));
    });

    req.on('error', (e) => {
      ERR('error in getBodyJSON:', e);
      resolve(err(`${e.name}:\n${e.message}`));
    });
  });
}
