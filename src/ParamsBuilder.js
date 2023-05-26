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
      if (!key.length || !value?.length) return;
      this.#query[key] = value;
    }
  }

  /**
   * @param {string[]} key_arr
   * @param {string[]} val_arr
   * @returns {void}
   */
  add_route_parameters(key_arr, val_arr) {
    if (key_arr.length !== val_arr.length) return;
    for (let i = 0; i < key_arr.length; i++) this.#route[key_arr[i]] = val_arr[i];
  }

  /** @returns {Params} */
  build() {
    return new Params(this.#query, this.#route);
  }
}
