import { ERR } from '@peter-schweitzer/ez-utils';
import { buildRes } from './utils.js';

/**
 * @param {ResolverLeaf} leaf
 * @returns {MiddlewareCurry}
 */
export function curry_middleware(leaf) {
  const curry = {
    get use() {
      return (middleware) => {
        if (leaf.middleware) leaf.middleware.push(middleware);
        else leaf.middleware = [middleware];
        return curry;
      };
    },
  };

  return Object.seal(curry);
}

/**
 * @param {FalseOr<Middleware[]>} middleware
 * @param {EZIncomingMessage} req
 * @param {ServerResponse} res
 * @param {LUT<string>} query
 * @param {LUT<string> & {"*"?: string[]}} route
 * @returns {Promise<boolean>} wether to do routing and or call ResFunction
 */
export async function handle_middleware(middleware, req, res, query, route) {
  if (middleware === false) return true;

  for (const mw of middleware) {
    /**@type {undefined|string} */
    //@ts-ignore ts-server back at it again void != undefined :skull:
    const middleware_err = mw.handle(req, res, query, route);
    if (middleware_err !== undefined) {
      if (res.writableEnded) ERR(`error in middleware (request got resolved):\n  ${middleware_err}`);
      else buildRes(res, middleware_err, { code: 500 });
      return false;
    } else if (res.writableEnded) return false;
  }

  return true;
}
