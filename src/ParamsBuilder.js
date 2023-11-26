import { Params } from './Params.js';

export class ParamsBuilder {
  /**@type {LUT<string>} */
  #query = {};
  /**@type {LUT<string>} */
  #route = {};

  /**
   * @param {string} query_string
   * @returns {void}
   */
  add_query_parameters(query_string = '') {
    if (!query_string.length) return;

    for (const kv of query_string.split('&')) {
      const [key, value] = kv.split('=');
      if (!key.length || !value?.length) continue;
      this.#query[key] = value;
    }
  }

  /**
   * @param {string[]} uri_fragments
   * @param {[string, number][]} params
   * @returns {void}
   */
  add_route_parameters(uri_fragments, params) {
    for (const param of params) this.#route[param[0]] = uri_fragments[param[1]];
  }

  /** @returns {Params} */
  build() {
    return new Params(this.#query, this.#route);
  }
}
