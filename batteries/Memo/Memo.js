//@ts-nocheck we gettin jiggy wid it

/** @implements {Middleware} */
export class Memo {
  /** @type {LUT<{status_code: number, status_message: string, head: LUT<string>, body: string}>} */
  #cache;

  get m_cache() {
    return this.#cache;
  }

  constructor() {
    this.#cache = {};
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {ServerResponse} res
   * @param {LUT<string>} query
   * @param {LUT<string> & { "*"?: string[] }} route
   * @returns {Promise<void|string>}
   */
  async handle(req, res, query, route) {
    if (Object.hasOwn(this.#cache, req.url)) {
      const { status_code, status_message, head, body } = this.#cache[req.url];
      res.writeHead(status_code, status_message, head).end(body);
      return;
    }

    res._head = {};
    res._body = '';

    res._sh = res.setHeader;
    res.setHeader = (name, value) => {
      res._head[name] = `${value}`;
      return res._sh(name, value);
    };

    res._shs = res.setHeaders;
    res.setHeaders = headers => {
      for (const [k, v] of headers) res._head[k] = `${v}`;
      return res._shs(headers);
    };

    res._wh = res.writeHead;
    res.writeHead = (statusCode, statusMessage, headers) => {
      const head =
        headers !== undefined ? headers
        : statusMessage !== undefined && typeof statusMessage !== 'string' ? statusMessage
        : [];

      for (const k in head) res._head[k] = `${head[k]}`;

      return res._wh(statusCode, statusMessage, headers);
    };

    res._w = res.write;
    res.write = (chunk, callback) => {
      if (typeof chunk === 'string') res._body += chunk;
      else res._body += chunk.toString();

      return res._w(chunk, callback);
    };

    res._e = res.end;
    res.end = (chunk, encoding, cb) => {
      if (chunk !== undefined && typeof chunk !== 'function')
        if (encoding !== undefined && typeof encoding !== 'function') res._body += chunk.toString(encoding);
        else res._body += `${chunk}`;

      this.#cache[req.url] = {
        status_code: res.statusCode,
        status_message: res.statusMessage,
        head: res._head,
        body: res._body,
      };

      return res._e(chunk, encoding, cb);
    };
  }
}
