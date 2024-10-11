import { ERR } from '@peter-schweitzer/ez-utils';

export class Middleware {
  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {boolean} */
  #strict;
  get strict() {
    return this.#strict;
  }

  /**
   * @param {string} name
   * @param {boolean} strict
   */
  constructor(name = null, strict = true) {
    this.#name = name ?? 'anonymous_middleware';
    this.#strict = strict;
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {ServerResponse} res
   * @param {LUT<string>} query
   * @param {LUT<string> & {"*"?: string[]}} route
   * @returns {Err|undefined}
   */
  handle(req, res, query, route) {
    ERR(`fallback to default impl of Middleware (name: '${this.#name}')`);
    return;
  }
}
