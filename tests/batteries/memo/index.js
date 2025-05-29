import assert from 'node:assert';
import { exit } from 'node:process';

import { p2eo } from '@peter-schweitzer/ez-utils';
import { App, buildRes, MIME } from '../../../index.js';

import { Memo } from '../../../batteries/index.js';

/**
 * @template T
 * @param {ErrorOr<T>} eo
 * @param {string} msg
 * @returns {T}
 */
function ASSERT_DATA(eo, msg) {
  assert(eo.err === null, msg);
  return eo.data;
}

const app = new App();
const memo = new Memo();
const cache = memo.m_cache;

let run_cnt = 0;

app
  .get('/add/:a/:b', (req, res, params) => {
    run_cnt++;
    const a = params.routeNumber('a', 0);
    const b = params.routeNumber('b', 0);
    buildRes(res, JSON.stringify({ augend: a, addend: b, sum: a + b }), { mime: MIME.JSON });
  })
  .use(memo);

app.listen(65535);

const uri = '/add/1/2';

const ftc = ASSERT_DATA(await p2eo(fetch(`http://localhost:65535${uri}`)), 'fetch errored');
const json = ASSERT_DATA(await p2eo(ftc.json()), 'json() errored');

assert(run_cnt === 1, 'run count is off');
assert(Object.hasOwn(cache, uri));
assert(cache[uri].status_code === ftc.status, 'err');
assert(cache[uri].status_message === ftc.statusText, 'err');

const ignore_headers = ['keep-alive', 'connection', 'date'];
const expected_head = {};
for (const [k, v] of ftc.headers) if (!ignore_headers.includes(k)) expected_head[k] = v;

const actual_head = {};
for (const k in cache[uri].head) actual_head[k.toLowerCase()] = cache[uri].head[k];

assert.deepStrictEqual(actual_head, expected_head, 'headers differ');
assert.strictEqual(cache[uri].body, JSON.stringify(json), 'body differs');

ASSERT_DATA(await p2eo(fetch('http://localhost:65535/add/1/2')), 'fetch errored');
assert(run_cnt === 1, 'run count is off');

ASSERT_DATA(await p2eo(fetch('http://localhost:65535/add/2/1')), 'fetch errored');
// @ts-ignore fetching should increment the value of run_cnt by 1
assert(run_cnt === 2, 'run count is off');
assert(Object.hasOwn(cache, '/add/2/1'));

ASSERT_DATA(await p2eo(fetch('http://localhost:65535/add/1/2')), 'fetch errored');
assert(run_cnt === 2, 'run count is off');

ASSERT_DATA(await p2eo(fetch('http://localhost:65535/add/2/1')), 'fetch errored');
assert(run_cnt === 2, 'run count is off');

await app.close();
exit(0);
