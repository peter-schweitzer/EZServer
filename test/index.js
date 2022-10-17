const assert = require('assert');
const { App, buildRes } = require('../index');

const app = new App();
app.listen('1234');

(async () => {
  const testFunction = (req, res) => {
    buildRes(res, `method: ${req.method} | route: ${req.url}`, { code: 200, mime: 'text/plain' });
  };

  app.get('/get', testFunction);
  assert(app.m_restEndpoints.GET['/get'] === testFunction, "get rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/get', method: 'GET' }) === testFunction, 'get');

  app.post('/post', testFunction);
  assert(app.m_restEndpoints.POST['/post'] === testFunction, "post rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/post', method: 'POST' }) === testFunction, 'post');

  app.put('/put', testFunction);
  assert(app.m_restEndpoints.PUT['/put'] === testFunction, "put rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/put', method: 'PUT' }) === testFunction, 'put');

  app.delete('/delete', testFunction);
  assert(app.m_restEndpoints.DELETE['/delete'] === testFunction, "delete rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/delete', method: 'DELETE' }) === testFunction, 'delete');

  app.patch('/patch', testFunction);
  assert(app.m_restEndpoints.PATCH['/patch'] === testFunction, "patch rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/patch', method: 'PATCH' }) === testFunction, 'patch');

  //*================*//

  app.add('/add', testFunction);
  assert(app.m_endpoints['/add'] === testFunction, "endpoint wasn't register");

  //*================*//
  //*================*//

  app.addRestRoute('get', '/get', testFunction);
  assert(app.m_restRouts.GET['/get'] === testFunction, "get rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/get/route/route-test', method: 'GET' }) === testFunction, 'get-route');

  app.addRestRoute('post', '/post', testFunction);
  assert(app.m_restRouts.POST['/post'] === testFunction, "post rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/post/route/route-test', method: 'POST' }) === testFunction, 'post-route');

  app.addRestRoute('put', '/put', testFunction);
  assert(app.m_restRouts.PUT['/put'] === testFunction, "put rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/put/route/route-test', method: 'PUT' }) === testFunction, 'put-route');

  app.addRestRoute('delete', '/delete', testFunction);
  assert(app.m_restRouts.DELETE['/delete'] === testFunction, "delete rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/delete/route/route-test', method: 'DELETE' }) === testFunction, 'delete-route');

  app.addRestRoute('patch', '/patch', testFunction);
  assert(app.m_restRouts.PATCH['/patch'] === testFunction, "patch rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/patch/route/route-test', method: 'PATCH' }) === testFunction, 'patch-route');

  //*================*//

  app.addRoute('/addRoute', testFunction);
  assert(app.m_routs['/addRoute'] === testFunction, "route wasn't register");
  assert(app.m_route({ uri: '/addRoute/route-test' }) === testFunction, 'addRoute');

  //*================*//
  //*================*//

  app.addGenericRestFunction('get', 'fn', testFunction);
  assert(app.m_genericRestFunctions.GET['fn'] === testFunction, "generic get function wasn't register");

  app.useGenericRestFunction('get', 'fn', '/get/generic/endpoint');
  assert(app.m_restEndpoints.GET['/get/generic/endpoint'] === testFunction, "generic get rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/get/generic/endpoint', method: 'GET' }) === testFunction, 'generic get');

  app.useGenericRestFunction('get', 'fn', '/get/generic', true);
  assert(app.m_restRouts.GET['/get/generic'] === testFunction, "generic get rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/get/generic/route-test', method: 'GET' }) === testFunction, 'generic get-route');

  app.addGenericRestFunction('post', 'fn', testFunction);
  assert(app.m_genericRestFunctions.POST['fn'] === testFunction, "generic post function wasn't register");

  app.useGenericRestFunction('post', 'fn', '/post/generic/endpoint');
  assert(app.m_restEndpoints.POST['/post/generic/endpoint'] === testFunction, "generic post rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/post/generic/endpoint', method: 'POST' }) === testFunction, 'generic post');

  app.useGenericRestFunction('post', 'fn', '/post/generic', true);
  assert(app.m_restRouts.POST['/post/generic'] === testFunction, "generic post rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/post/generic/route-test', method: 'POST' }) === testFunction, 'generic post-route');

  app.addGenericRestFunction('put', 'fn', testFunction);
  assert(app.m_genericRestFunctions.PUT['fn'] === testFunction, "generic put function wasn't register");

  app.useGenericRestFunction('put', 'fn', '/put/generic/endpoint');
  assert(app.m_restEndpoints.PUT['/put/generic/endpoint'] === testFunction, "generic put rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/put/generic/endpoint', method: 'PUT' }) === testFunction, 'generic put');

  app.useGenericRestFunction('put', 'fn', '/put/generic', true);
  assert(app.m_restRouts.PUT['/put/generic'] === testFunction, "generic put rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/put/generic/route-test', method: 'PUT' }) === testFunction, 'generic put-route');

  app.addGenericRestFunction('delete', 'fn', testFunction);
  assert(app.m_genericRestFunctions.DELETE['fn'] === testFunction, "generic delete function wasn't register");

  app.useGenericRestFunction('delete', 'fn', '/delete/generic/endpoint');
  assert(app.m_restEndpoints.DELETE['/delete/generic/endpoint'] === testFunction, "generic delete rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/delete/generic/endpoint', method: 'DELETE' }) === testFunction, 'generic delete');

  app.useGenericRestFunction('delete', 'fn', '/delete/generic', true);
  assert(app.m_restRouts.DELETE['/delete/generic'] === testFunction, "generic delete rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/delete/generic/route-test', method: 'DELETE' }) === testFunction, 'generic delete-route');

  app.addGenericRestFunction('patch', 'fn', testFunction);
  assert(app.m_genericRestFunctions.PATCH['fn'] === testFunction, "generic patch function wasn't register");

  app.useGenericRestFunction('patch', 'fn', '/patch/generic/endpoint');
  assert(app.m_restEndpoints.PATCH['/patch/generic/endpoint'] === testFunction, "generic patch rest-endpoint wasn't register");
  assert(app.m_restEndpoint({ uri: '/patch/generic/endpoint', method: 'PATCH' }) === testFunction, 'generic patch');

  app.useGenericRestFunction('patch', 'fn', '/patch/generic', true);
  assert(app.m_restRouts.PATCH['/patch/generic'] === testFunction, "generic patch rest-route wasn't register");
  assert(app.m_restRoute({ uri: '/patch/generic/route-test', method: 'PATCH' }) === testFunction, 'generic patch-route');

  //*================*//

  app.addGenericFunction('fn', testFunction);

  app.useGenericFunction('fn', '/generic');
  assert(app.m_endpoints['/generic'] === testFunction, "generic endpoint wasn't register");

  app.useGenericFunction('fn', '/generic', true);
  assert(app.m_routs['/generic'], "generic route wasn't register");
  assert(app.m_route({ uri: '/generic/route-test' }) === testFunction, 'generic route');

  ///////////
  ///////////

  async function test() {
    for (const [u, m] of [
      ['/get', 'GET'],
      ['/post', 'POST'],
      ['/put', 'PUT'],
      ['/delete', 'DELETE'],
      ['/patch', 'PATCH'],
      ['/add', 'GET'],
      ['/get/route-test', 'GET'],
      ['/post/route-test', 'POST'],
      ['/put/route-test', 'PUT'],
      ['/delete/route-test', 'DELETE'],
      ['/patch/route-test', 'PATCH'],
      ['/addRoute/route-test', 'GET'],
      ['/get/generic/endpoint', 'GET'],
      ['/get/generic/route-test', 'GET'],
      ['/post/generic/endpoint', 'POST'],
      ['/post/generic/route-test', 'POST'],
      ['/put/generic/endpoint', 'PUT'],
      ['/put/generic/route-test', 'PUT'],
      ['/delete/generic/endpoint', 'DELETE'],
      ['/delete/generic/route-test', 'DELETE'],
      ['/patch/generic/endpoint', 'PATCH'],
      ['/patch/generic/route-test', 'PATCH'],
      ['/generic/endpoint', 'GET'],
      ['/generic/route-test', 'GET'],
    ]) {
      const txt = await (await fetch('http://127.0.0.1:1234' + u, { method: m })).text();
      console.log(m, u, txt);
      assert(txt === `method: ${m} | route: ${u}`, u);
    }
  }

  await test();
  app.close();
})();
