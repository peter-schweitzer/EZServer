const assert = require('assert');
const { App, buildRes } = require('../index');
const { Parameters } = require('../src/parameters');

const app = new App();
app.listen('1234');

(async () => {
  /**
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   * @param {Parameters} p
   */
  const testFunction = (req, res, p) => {
    const { query, route } = p.m_parameters;
    buildRes(res, `method: ${req.method} | route: ${req.url} | param (querry): ${Object.keys(query).length} | param (route): ${Object.keys(route).length}`, {
      code: 200,
      mime: 'text/plain',
    });
  };

  app.get('/get', testFunction);
  assert(app.m_rest_endpoints.GET['/get'] === testFunction, "get rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/get', method: 'GET' }) === testFunction, 'get');

  app.post('/post', testFunction);
  assert(app.m_rest_endpoints.POST['/post'] === testFunction, "post rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/post', method: 'POST' }) === testFunction, 'post');

  app.put('/put', testFunction);
  assert(app.m_rest_endpoints.PUT['/put'] === testFunction, "put rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/put', method: 'PUT' }) === testFunction, 'put');

  app.delete('/delete', testFunction);
  assert(app.m_rest_endpoints.DELETE['/delete'] === testFunction, "delete rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/delete', method: 'DELETE' }) === testFunction, 'delete');

  app.patch('/patch', testFunction);
  assert(app.m_rest_endpoints.PATCH['/patch'] === testFunction, "patch rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/patch', method: 'PATCH' }) === testFunction, 'patch');

  //*================*//

  app.add('/add', testFunction);
  assert(app.m_endpoints['/add'] === testFunction, "endpoint wasn't register");

  //*================*//
  //*================*//

  app.addRestRoute('get', '/get', testFunction);
  assert(app.m_rest_routes.GET['/get'] === testFunction, "get rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/get/route/route-test', method: 'GET' }) === testFunction, 'get-route');

  app.addRestRoute('post', '/post', testFunction);
  assert(app.m_rest_routes.POST['/post'] === testFunction, "post rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/post/route/route-test', method: 'POST' }) === testFunction, 'post-route');

  app.addRestRoute('put', '/put', testFunction);
  assert(app.m_rest_routes.PUT['/put'] === testFunction, "put rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/put/route/route-test', method: 'PUT' }) === testFunction, 'put-route');

  app.addRestRoute('delete', '/delete', testFunction);
  assert(app.m_rest_routes.DELETE['/delete'] === testFunction, "delete rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/delete/route/route-test', method: 'DELETE' }) === testFunction, 'delete-route');

  app.addRestRoute('patch', '/patch', testFunction);
  assert(app.m_rest_routes.PATCH['/patch'] === testFunction, "patch rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/patch/route/route-test', method: 'PATCH' }) === testFunction, 'patch-route');

  //*================*//

  app.addRoute('/addRoute', testFunction);
  assert(app.m_routs['/addRoute'] === testFunction, "route wasn't register");
  assert(app.m_route({ uri: '/addRoute/route-test' }) === testFunction, 'addRoute');

  //*================*//
  //*================*//

  app.addGenericRestFunction('get', 'fn', testFunction);
  assert(app.m_generic_rest_functions.GET['fn'] === testFunction, "generic get function wasn't register");

  app.useGenericRestFunction('get', 'fn', '/get/generic/endpoint');
  assert(app.m_rest_endpoints.GET['/get/generic/endpoint'] === testFunction, "generic get rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/get/generic/endpoint', method: 'GET' }) === testFunction, 'generic get');

  app.useGenericRestFunction('get', 'fn', '/get/generic', true);
  assert(app.m_rest_routes.GET['/get/generic'] === testFunction, "generic get rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/get/generic/route-test', method: 'GET' }) === testFunction, 'generic get-route');

  app.addGenericRestFunction('post', 'fn', testFunction);
  assert(app.m_generic_rest_functions.POST['fn'] === testFunction, "generic post function wasn't register");

  app.useGenericRestFunction('post', 'fn', '/post/generic/endpoint');
  assert(app.m_rest_endpoints.POST['/post/generic/endpoint'] === testFunction, "generic post rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/post/generic/endpoint', method: 'POST' }) === testFunction, 'generic post');

  app.useGenericRestFunction('post', 'fn', '/post/generic', true);
  assert(app.m_rest_routes.POST['/post/generic'] === testFunction, "generic post rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/post/generic/route-test', method: 'POST' }) === testFunction, 'generic post-route');

  app.addGenericRestFunction('put', 'fn', testFunction);
  assert(app.m_generic_rest_functions.PUT['fn'] === testFunction, "generic put function wasn't register");

  app.useGenericRestFunction('put', 'fn', '/put/generic/endpoint');
  assert(app.m_rest_endpoints.PUT['/put/generic/endpoint'] === testFunction, "generic put rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/put/generic/endpoint', method: 'PUT' }) === testFunction, 'generic put');

  app.useGenericRestFunction('put', 'fn', '/put/generic', true);
  assert(app.m_rest_routes.PUT['/put/generic'] === testFunction, "generic put rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/put/generic/route-test', method: 'PUT' }) === testFunction, 'generic put-route');

  app.addGenericRestFunction('delete', 'fn', testFunction);
  assert(app.m_generic_rest_functions.DELETE['fn'] === testFunction, "generic delete function wasn't register");

  app.useGenericRestFunction('delete', 'fn', '/delete/generic/endpoint');
  assert(app.m_rest_endpoints.DELETE['/delete/generic/endpoint'] === testFunction, "generic delete rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/delete/generic/endpoint', method: 'DELETE' }) === testFunction, 'generic delete');

  app.useGenericRestFunction('delete', 'fn', '/delete/generic', true);
  assert(app.m_rest_routes.DELETE['/delete/generic'] === testFunction, "generic delete rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/delete/generic/route-test', method: 'DELETE' }) === testFunction, 'generic delete-route');

  app.addGenericRestFunction('patch', 'fn', testFunction);
  assert(app.m_generic_rest_functions.PATCH['fn'] === testFunction, "generic patch function wasn't register");

  app.useGenericRestFunction('patch', 'fn', '/patch/generic/endpoint');
  assert(app.m_rest_endpoints.PATCH['/patch/generic/endpoint'] === testFunction, "generic patch rest-endpoint wasn't register");
  assert(app.m_rest_endpoint({ uri: '/patch/generic/endpoint', method: 'PATCH' }) === testFunction, 'generic patch');

  app.useGenericRestFunction('patch', 'fn', '/patch/generic', true);
  assert(app.m_rest_routes.PATCH['/patch/generic'] === testFunction, "generic patch rest-route wasn't register");
  assert(app.m_rest_route({ uri: '/patch/generic/route-test', method: 'PATCH' }) === testFunction, 'generic patch-route');

  //*================*//

  app.addGenericFunction('fn', testFunction);

  app.useGenericFunction('fn', '/generic');
  assert(app.m_endpoints['/generic'] === testFunction, "generic endpoint wasn't register");

  app.useGenericFunction('fn', '/generic', true);
  assert(app.m_routs['/generic'], "generic route wasn't register");
  assert(app.m_route({ uri: '/generic/route-test' }) === testFunction, 'generic route');

  //*================*//
  //*================*//

  app.get('/param/:prm', testFunction);
  assert(app.m_rest_endpoint_with_param({ uri: '/param/pram-val', method: 'GET' }, new Parameters()) === testFunction, 'rest endpoint with param');

  app.add('/param2/:prm1/:prm2', testFunction);
  assert(app.m_endpoint_with_param({ uri: '/param2/pram1-val/pram2-val' }, new Parameters()) === testFunction, 'endpoint with param');

  ///////////
  ///////////

  async function test() {
    for (const [u, m, q, r] of [
      ['/get', 'GET', 0, 0],
      ['/post', 'POST', 0, 0],
      ['/put', 'PUT', 0, 0],
      ['/delete', 'DELETE', 0, 0],
      ['/patch', 'PATCH', 0, 0],
      ['/add', 'GET', 0, 0],
      ['/get/route-test', 'GET', 0, 0],
      ['/post/route-test', 'POST', 0, 0],
      ['/put/route-test', 'PUT', 0, 0],
      ['/delete/route-test', 'DELETE', 0, 0],
      ['/patch/route-test', 'PATCH', 0, 0],
      ['/addRoute/route-test', 'GET', 0, 0],
      ['/get/generic/endpoint', 'GET', 0, 0],
      ['/get/generic/route-test', 'GET', 0, 0],
      ['/post/generic/endpoint', 'POST', 0, 0],
      ['/post/generic/route-test', 'POST', 0, 0],
      ['/put/generic/endpoint', 'PUT', 0, 0],
      ['/put/generic/route-test', 'PUT', 0, 0],
      ['/delete/generic/endpoint', 'DELETE', 0, 0],
      ['/delete/generic/route-test', 'DELETE', 0, 0],
      ['/patch/generic/endpoint', 'PATCH', 0, 0],
      ['/patch/generic/route-test', 'PATCH', 0, 0],
      ['/generic/endpoint', 'GET', 0, 0],
      ['/generic/route-test', 'GET', 0, 0],
      ['/get?a=a&b=b&c=c', 'GET', 3, 0],
      ['/param/prm?a=a&b=b&c=c', 'GET', 3, 1],
      ['/param/prm', 'GET', 0, 1],
      ['/param2/pram1-val/pram2-val?a=a&b=b&c=c', 'GET', 3, 2],
      ['/param2/pram1-val/pram2-val', 'GET', 0, 2],
    ]) {
      const txt = await (await fetch('http://127.0.0.1:1234' + u, { method: m })).text();
      console.log(m, u, txt);
      assert(txt === `method: ${m} | route: ${u} | param (querry): ${q} | param (route): ${r}`, u);
    }
  }

  await test();
  app.close();
})();
