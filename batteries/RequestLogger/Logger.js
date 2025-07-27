import { LOG } from '@peter-schweitzer/ez-utils';

export class Logger {
  constructor() {}

  /**
   * @param req {EZIncomingMessage}
   * @param res {ServerResponse}
   * @param query {{[k: string]: string}}
   * @param route {{[k: string]: string} & { '*'? : string[] }}
   * @returns {Promise<void|string>}
   */
  async handle(req, res, query, route) {
    const { uri, method = 'NONE' } = req;
    const query_str = Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    const c = new ColorizedStringBuilder();

    c.green(method, true)._(' ').blue(uri);
    if (query_str.length > 0) c.purple('?' + query_str);
    c._(' ');

    const start = Date.now();
    res.on('close', (_) => {
      const dt = Date.now() - start;
      const code = res.statusCode;

      if (code >= 500) c.red(code, true);
      else if (code >= 400) c.yellow(code, true);
      else if (code >= 300) c.yellow(code);
      else c.green(code);

      c._(` ${dt}ms`);
      LOG(c.flush());
    });
  }
}

class ColorizedStringBuilder {
  /** @type {string[]} */
  #buff = [];
  constructor() {}

  /**
   * @param col {number}
   * @param a {any}
   * @param bold {boolean}
   */
  #_(col, a, bold = false) {
    this.#buff.push(`\x1b[3${col}${bold ? ';1' : ''}m${a}\x1b[0m`);
  }

  /**
   * @param a {any}
   * @return {ColorizedStringBuilder}
   */
  _(a) {
    this.#buff.push(`${a}`);
    return this;
  }

  /**
   * @param a {any}
   * @param [bold=false] {boolean}
   * @return {ColorizedStringBuilder}
   */
  red(a, bold = false) {
    this.#_(1, a, bold);
    return this;
  }

  /**
   * @param a {any}
   * @param [bold=false] {boolean}
   * @return {ColorizedStringBuilder}
   */
  green(a, bold = false) {
    this.#_(2, a, bold);
    return this;
  }

  /**
   * @param a {any}
   * @param [bold=false] {boolean}
   * @return {ColorizedStringBuilder}
   */
  yellow(a, bold = false) {
    this.#_(3, a, bold);
    return this;
  }

  /**
   * @param a {any}
   * @param [bold=false] {boolean}
   * @return {ColorizedStringBuilder}
   */
  blue(a, bold = false) {
    this.#_(4, a, bold);
    return this;
  }

  /**
   * @param a {any}
   * @param [bold=false] {boolean}
   * @return {ColorizedStringBuilder}
   */
  purple(a, bold = false) {
    this.#_(5, a, bold);
    return this;
  }

  flush() {
    const str = this.#buff.join('');
    this.#buff = [];
    return str;
  }
}
