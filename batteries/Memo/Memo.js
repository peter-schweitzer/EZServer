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

    const head_lut = {};
    let body_parts = [];

    res._sh = res.setHeader;
    res.setHeader = (name, value) => {
      head_lut[name] = `${value}`;
      return res._sh(name, value);
    };

    res._shs = res.setHeaders;
    res.setHeaders = (headers) => {
      for (const [k, v] of headers) head_lut[k] = `${v}`;
      return res._shs(headers);
    };

    res._wh = res.writeHead;
    res.writeHead = (statusCode, statusMessageOrHeaders, headers) => {
      const head = headers ?? (typeof statusMessageOrHeaders === 'object' ? statusMessageOrHeaders : {});

      for (const k in head) head_lut[k] = `${head[k]}`;

      return res._wh(statusCode, statusMessageOrHeaders, headers);
    };

    res._w = res.write;
    res.write = (chunk, callback) => {
      if (typeof chunk === 'string') body_parts.push(chunk);
      else body_parts.push(`${chunk}`);

      return res._w(chunk, callback);
    };

    res._e = res.end;
    res.end = (chunk, encoding, cb) => {
      if (chunk !== undefined && typeof chunk !== 'function')
        if (encoding !== undefined && typeof encoding !== 'function') body_parts.push(chunk.toString(encoding));
        else body_parts.push(`${chunk}`);

      this.#cache[req.url] = {
        status_code: res.statusCode,
        status_message: res.statusMessage,
        head: head_lut,
        body: body_parts.join(''),
      };

      return res._e(chunk, encoding, cb);
    };
  }
}
