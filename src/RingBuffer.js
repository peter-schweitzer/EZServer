import { LOG, WRN } from '@peter-schweitzer/ez-utils';

/** @template T */
export class RingBuffer {
  /** @type {Array<T|undefined>} */
  #buf_arr;
  get size() {
    return this.#buf_arr.length;
  }

  /** @type {number} */
  #length;
  get length() {
    return this.#length;
  }

  /** @type {number} */
  #mask;

  /** @type {number} */
  #h;
  /** @type {number} */
  #t;

  /** @param {number} [initialSize=8] */
  constructor(initialSize = 8) {
    let initial_size_exp = 0;
    while (initialSize >> initial_size_exp > 1) initial_size_exp++;
    const initial_size = 1 << initial_size_exp;

    LOG(`got initial size ${initialSize}, initializing with ${initial_size} (2^${initial_size_exp})`);

    this.#buf_arr = new Array(initial_size);
    this.#length = 0;
    this.#mask = initial_size - 1;
    this.#h = 0;
    this.#t = 0;
  }

  #resize() {
    WRN(`resizing RingBuffer (was ${this.#buf_arr.length})`);

    const new_buf_arr = new Array(this.#buf_arr.length << 1);
    this.#mask = (this.#mask << 1) | 1;

    for (let i = 0; i < this.#length; i++) new_buf_arr[i] = this.#buf_arr[(this.#h + i) % this.#buf_arr.length];

    this.#t -= this.#h;
    this.#h = 0;

    this.#buf_arr = new_buf_arr;
  }

  /**
   * @param {T} value
   * @returns {void}
   */
  enqueue(value) {
    if (this.#length++ === this.#buf_arr.length) this.#resize();

    this.#buf_arr[this.#t++ & this.#mask] = value;
  }

  /** @returns {T|undefined} */
  dequeue() {
    if (this.#length === 0) return undefined;

    const idx = this.#h++ & this.#mask;
    this.#length--;

    const ret = this.#buf_arr[idx];
    this.#buf_arr[idx] = undefined;
    return ret;
  }
}

export class WildcardQueueNode {
  /** @type {number} */
  i;
  /** @type {WildcardTreeNode} */
  node;

  /**
   * @param {number} i
   * @param {WildcardTreeNode} node
   */
  constructor(i, node) {
    this.i = i;
    this.node = node;
  }
}
