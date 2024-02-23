import { WRN } from '@peter-schweitzer/ez-utils';

/** @template T */
export class RingBuffer {
  /** @type {Array<T|undefined>} */
  #buf_arr;

  /** @type {number} */
  #length;
  get length() {
    return this.#length;
  }

  /** @type {number} */
  #h;
  /** @type {number} */
  #t;

  /** @param {number} [initialSize=8] */
  constructor(initialSize = 8) {
    this.#buf_arr = new Array(initialSize);
    this.#length = 0;
    this.#h = 0;
    this.#t = 0;
  }

  #resize() {
    WRN(`resizing RingBuffer (was ${this.#buf_arr.length})`);

    const new_buf_arr = new Array(this.#buf_arr.length * 2);

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

    this.#buf_arr[this.#t++ % this.#buf_arr.length] = value;
  }

  /** @returns {T|undefined} */
  dequeue() {
    if (this.#length === 0) return undefined;

    const idx = this.#h++ % this.#buf_arr.length;
    this.#length--;

    const ret = this.#buf_arr[idx];
    this.#buf_arr[idx] = undefined;
    return ret;
  }
}
