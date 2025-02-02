import { readFile } from 'node:fs/promises';

import { ERR, LOG, WRN, data, err, p2eo } from '@peter-schweitzer/ez-utils';

/** @type {LUT<string>} */
import mime_types from '../data/mimeTypes.json' with { type: 'json' };

export const MIME = Object.freeze({ TEXT: 'text/plain;charset=UTF-8', HTML: 'text/html;charset=UTF-8', JSON: 'application/json' });

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
 * @param {ServerResponse} res response from the Server
 * @param {string} filePath path of the file
 * @param {Object} [options={code: 200, mime: null}]
 * @param {number} [options.code=200] status code of the response (default is 200)
 * @param {string?} [options.mime=null] if set this overwrites the file-extension based lookup
 * @returns {Promise<void>}
 */
export async function serveFromFS(res, filePath, { code, mime } = { code: 200, mime: null }) {
  LOG('reading file from FS:', filePath);
  const { err, data } = await p2eo(readFile(filePath));
  if (err !== null) return buildRes(res, `error while loading file from fs:\n${err}`, { code: 500, mime: MIME.TEXT });

  if (mime === null) {
    const file_ending = filePath.slice(filePath.lastIndexOf('.') + 1);
    if (Object.hasOwn(mime_types, file_ending)) mime = mime_types[file_ending];
    else {
      WRN(`mime-type for '${file_ending}' not found`);
      mime = MIME.TEXT;
    }
  }

  buildRes(res, data, { code, mime });
}

/**
 * @param {IncomingMessage} req
 * @param {{}} [obj={}] intended to be used for object pooling
 * @return {AsyncErrorOr<string>} - may return empty string
 */
export function getBodyText(req, obj = {}) {
  return new Promise((resolve, _) => {
    let buff = '';

    req.on('data', (chunk) => (buff += chunk.toString('utf8')));
    req.on('end', () => resolve(data(buff, obj)));
    req.on('error', (e) => resolve(err(`error '${e.name}' while accumulating request body: '${e.message}'`, obj)));
  });
}

/**
 * @param {IncomingMessage} req
 * @param {{}} [obj={}] intended to be used for object pooling
 * @return {AsyncErrorOr<any>}
 */
export async function getBodyJSON(req, obj = {}) {
  const eo_txt = await getBodyText(req, obj);
  if (eo_txt.err !== null) return eo_txt;
  if (eo_txt.data === '') return err('request body is empty');

  try {
    return data(JSON.parse(eo_txt.data), obj);
  } catch (e) {
    ERR(`${'\x1b[32;1m'}error in getBodyJSON caused by JSON.parse:${'\x1b[0m'}\n  ${e}`);
    return err(`error while parsing request body: '${typeof e === 'string' ? e : JSON.stringify(e)}'`, obj);
  }
}

/**
 * @param {IncomingMessage} req
 * @param {{}} [obj={}] intended to be used for object pooling
 * @return {ErrorOr<LUT<string>>}
 */
export function getCookies(req, obj = {}) {
  if (!Object.hasOwn(req.headers, 'cookie')) return err('no cookie header present');

  const cookies = req.headers.cookie;
  if (cookies === null) return err('cookie header is null');

  /** @type {LUT<string>} */
  const cookie_lut = {};
  for (const crumb of cookies.split('; ')) {
    const [k, v] = crumb.split('=');
    cookie_lut[k] = v;
  }
  return data(cookie_lut);
}
