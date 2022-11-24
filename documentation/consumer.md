# consumer documentation

ezserver-package <br>
| <br>
|-[definitions](#definitions) <br>
|-[App (main EZServer class)](#app) <br>
|-[Parameters](#parameters) <br>
'-[utils](#utils) <br>

## definitions

definitions<br>
|<br>
|-[specificity](#specificity)<br>
|-[resolver](#resolver)<br>
|-[resFunction](#resFunction)<br>
|-[endpoint](#resolver)<br>
'-[route](#resFunction)<br>

### specificity

The specificity of an URI decides when in the order of look ups it is considered to fitting.

specificity: rest endpoint > endpoint > rest endpoint with route param(s) > endpoint with route param(s) > rest route > route

### resolver

Resolver describes every function that resolves a request.
Every function you register as an [endpoint](#endpoint) or [route](#route) is referred to as resolver or the type [resFunction](#resFunction).

### resFunction

> ```js
> resFunction(req: IncomingMessage, res: ServerResponse, parameters: Parameters): void
> ```

A resFunction is a callback that resolves a request.
This means that the request shall be handled correctly and

### endpoint

endpoints are URIs that have to be matched exactly to be triggered.

rest endpoints have the highest [specificity](#specificity)
endpoints have the next highest [specificity](#specificity)

### route

routes are URIs that can be triggered by any URI that starts with the route (can be arbitrarily long)

<!---->

## App

App - main class of EZServer<br>
|<br>
|-_**[application life time:](#application-life-time)**_<br>
| |-[constructor](#constructor)<br>
| |-[listen](#listen)<br>
| '-[close](#close)<br>
|<br>
|-_**[endpoints:](#endpoints)**_<br>
| |-[get](#get)<br>
| |-[head](#head)<br>
| |-[post](#post)<br>
| |-[put](#put)<br>
| |-[delete](#delete)<br>
| |-[connect](#connect)<br>
| |-[options](#options)<br>
| |-[trace](#trace)<br>
| |-[patch](#patch)<br>
| |<br>
| '-[add](#add)<br>
|<br>
|-_**[routs:](#routs)**_<br>
| |-[addRestRoute](#addRestRoute)<br>
| '-[addRoute](#addRoute)<br>
|<br>
|<br>
|-_**[generic functions:](#generic-functions)**_<br>
| |-[addGenericRestFunction](#addGenericRestFunction)<br>
| |-[useGenericRestFunction](#useGenericRestFunction)<br>
| |<br>
| |-[addGenericFunction](#addGenericFunction)<br>
| '-[useGenericFunction](#useGenericFunction)<br>
|<br>
'-_**[internals](#internals)**_<br>

```js
const { App } = require('@peter-schweitzer/ezserver'); // require App from EZServer
```

### application life time

_**application life time**_<br>
|<br>
|-[constructor](#constructor)<br>
|-[listen](#listen)<br>
'-[close](#close)<br>

#### constructor

```js
constructor(): void
```

```js
const app = new App();
```

Here `App` is the main EZServer class.
Here `const app` is the variable holding the newly instantiated [EZServer instance](#app).

The constructor is called without any arguments.

#### listen

```js
listen(port: number|string): void
```

```js
app.listen(8080);
```

Here `app` is the [EZServer instance](#app).

listen is basically a passthrough to the underlying node:http-Server-Instance
when called with a valid number or string the [EZServer instance](#app) will start handling requests

#### close

```js
close(): void
```

```js
app.close();
```

Here `app` is the [EZServer instance](#app) instance.

close is basically a passthrough to the underlying node:http Server instance
when called (with no arguments) the Server-instance will stop handling requests
If an error occurs (this happens when the server is not open and close() is called) it will be logged, but not propagated.

### endpoints

_**endpoints:**_<br>
|<br>
|-[rest endpoints](#restendpoints)<br>
| |-[get](#get)<br>
| |-[head](#head)<br>
| |-[post](#post)<br>
| |-[put](#put)<br>
| |-[delete](#delete)<br>
| |-[connect](#connect)<br>
| |-[options](#options)<br>
| |-[trace](#trace)<br>
| '-[patch](#patch)<br>
|<br>
'-[add](#add)<br>

#### rest endpoints

##### get

```js
get(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.get('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered get-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'GET' and it is the most [specific](#specificity) [resolver](#resolver).

##### head

```js
head(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.head('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered head-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'HEAD' and it is the most [specific](#specificity) [resolver](#resolver).

##### post

```js
post(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.post('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered post-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'POST' and it is the most [specific](#specificity) [resolver](#resolver).

##### put

```js
put(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.put('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered put-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'PUT' and it is the most [specific](#specificity) [resolver](#resolver).

##### delete

```js
delete(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.delete('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered delete-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'DELETE' and it is the most [specific](#specificity) [resolver](#resolver).

##### connect

```js
connect(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.connect('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered connect-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'CONNECT' and it is the most [specific](#specificity) [resolver](#resolver).

##### options

```js
options(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.options('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered options-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'OPTIONS' and it is the most [specific](#specificity) [resolver](#resolver).

##### trace

```js
trace(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.trace('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered trace-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'TRACE' and it is the most [specific](#specificity) [resolver](#resolver).

##### patch

```js
patch(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.patch('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered patch-catchall');
});
```

Here `app` is the [EZServer instance](#app).
The function is called if the http-method is 'PATCH' and it is the most [specific](#specificity) [resolver](#resolver).

#### add

```js
add(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.add('/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered catchall for all http methods');
});
```

Here `app` is the [EZServer instance](#app).
The function is called regardless of HTTP method and if it is the most [specific](#specificity) [resolver](#resolver).

### routs

_**routs:**_<br>
|<br>
|-[addRestRoute](#addRestRoute)<br>
'-[addRoute](#addRoute)<br>

#### addRestRoute

> ```js
> addRestRoute(method: string, uri: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
> ```

> ```js
> app.addRestRoute(HTTP_METHODS.GET, '/get', (req, res, param) => {
>   buildRes(res, "triggered '/get' fot HTTP method 'GET'");
> });
> ```

Here `app` is the [EZServer instance](#app).
Here `HTTP_METHODS` is the [HTTP_METHODS object](#http_methods).

The function is called if the http-method matches the specified method and it is the most [specific](#specificity) [resolver](#resolver).
The function only succeeds (returns true) if the specified method is valid (see [HTTP_METHODS object](#http_methods) for more information).

#### addRoute

```js
addRoute(uri: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.addRoute(HTTP_METHODS.GET, '/', (req, res, _) => {
  console.log(req.uri);
  buildRes(res, 'triggered catchall for all http methods');
});
```

Here `app` is the [EZServer instance](#app).
Here `HTTP_METHODS` is the [HTTP_METHODS object](#http_methods).

The function is called regardless of HTTP method and if it is the most [specific](#specificity) [resolver](#resolver).

### generic functions

_**generic functions:**_<br>
|<br>
|-[addGenericRestFunction](#addGenericRestFunction)<br>
|-[useGenericRestFunction](#useGenericRestFunction)<br>
|<br>
|-[addGenericFunction](#addGenericFunction)<br>
'-[useGenericFunction](#useGenericFunction)<br>

#### addGenericRestFunction

> ```js
> addGenericRestFunction(method: string, functionName: string, fn: resFunction): boolean
> ```

> ```js
> app.addGenericRestFunction(HTTP_METHODS.GET, 'GenericGET', (_, res, _) => {
>   buildRes(res, "triggered generic rest function for method 'GET', named 'GenericGET'");
> });
> ```

Here `app` is the [EZServer instance](#app).
Here `HTTP_METHODS` is the [HTTP_METHODS object](#http_methods).

The function is stored in the [EZServer instance](#app) under the name `GenericGET`.
It can be used unlimited times.
[To do so](#usegenericrestfunction) reference it by it's name ('GenericGET').
The function only succeeds (returns true) if the specified method is valid (see [HTTP_METHODS object](#http_methods) for more information).

#### useGenericRestFunction

> ```js
> useGenericRestFunction(method: string, functionName: string, uri: string, isRoute: boolean false): boolean
> ```

> ```js
> app.useGenericRestFunction(HTTP_METHODS.GET, 'GenericGet', '/generic ', false): boolean
> app.useGenericRestFunction(HTTP_METHODS.GET, 'GenericGet', '/generic/route ', true): boolean
> ```

Here `app` is the [EZServer instance](#app).
Here `HTTP_METHODS` is the [HTTP_METHODS object](#http_methods).

The `functionName` is the name given to the function you want to use use (see [addGenericRestFunction](#addgenericrestfunction))
If `isRoute` is set to `false` the function uses the same mechanism, as the functions described in the [rest endpoints](#restendpoints) section, under the hood.
If `isRoute` is set to `true` the function uses the same mechanism as [addRestRoute](#addrestroute) under the hood.
The function only succeeds (returns true) if the specified method is valid (see [HTTP_METHODS object](#http_methods) for more information).

#### addGenericFunction

> ```js
> addGenericFunction(functionName: string, fn: resFunction): boolean
> ```

> ```js
> app.addGenericFunction('Generic', (_, res, _) => {
>   buildRes(res, "triggered generic function named 'Generic'");
> });
> ```

Here `app` is the [EZServer instance](#app).

The function is stored in the [EZServer instance](#app) under the name `Generic`.
It can be used unlimited times.
[To do so](#usegenericrestfunction) reference it by it's name ('Generic').

#### useGenericFunction

> ```js
> useGenericFunction(functionName: string, uri: string, isRoute: boolean false): boolean
> ```

> ```js
> app.useGenericFunction('GenericGet', '/generic ', false): boolean
> app.useGenericFunction('GenericGet', '/generic/route ', true): boolean
> ```

Here `app` is the [EZServer instance](#app).

The `functionName` is the name given to the function you want to use use (see [addGenericFunction](#addgenericfunction))
If `isRoute` is set to `false` the function uses the same mechanism as [add](#add) under the hood.
If `isRoute` is set to `true` the function uses the same mechanism as [addRoute](#addroute) under the hood.

### Internals

Internal variables and functions are prefixed with `m_` and in snake-case.
You can access and modify all of the internal data-structures, but is strongly discouraged unless you know what you are doing.

You can read more about the implementation in [`dev.md > App > internals`](https://github.com/peter-schweitzer/EZServer/tree/master/documentation/dev.md#internals).

<!---->

## Parameters

Parameters<br>
|<br>
|-[query](#query)<br>
|-[queryInt](#queryInt)<br>
|<br>
|-[route](#route)<br>
'-[routeInt](#routeInt)<br>

[Parameters](#Parameters) is the helper class that provides a simple API for getting query- and route-parameters

### query

> ```js
> param.query(name: string, defaultValue: ?string): ?string;
> ```

if `name` is a truthy string and has a corresponding value the value, otherwise null, is returned.

### queryInt

> ```js
> param.queryInt(name: string, defaultValue: ?number): ?number;
> ```

if `name` is a truthy string and has a corresponding value, it is parsed to an int and if successful the number is returned.
Otherwise null is returned.

### route

> ```js
> param.route(name: string, defaultValue: ?string): ?string;
> ```

if `name` is a truthy string and has a corresponding value the value, otherwise null, is returned.

### routeInt

> ```js
> param.routeInt(name: string, defaultValue: ?number): ?number;
> ```

if `name` is a truthy string and has a corresponding value, it is parsed to an int and if successful the number is returned.
Otherwise null is returned.

<!---->

## utils

utils<br>
|<br>
|-[buildRes](#buildRes)<br>
|-[getType](#getType)<br>
|-[serveFromFS](#serveFromFS)<br>
|-[getBodyJSON](#getBodyJSON)<br>
|-[throw404](#throw404)<br>
'-[HTTP_METHODS](#http_methods)<br>

### buildRes

```js
buildRes(res: node:http.ServerResponse, data: any, { code: ?number = 200, mime: ?string = 'text/plain' }): void
```

### getType

> ```js
> getType(filePathOrName: string): string
> ```

Here `filePathOrName` is the name of a file with a file ending (delimited by a '.')

Returns the correct ContentType string based on the ending (string after the last '.') of filePathOrName.

### serveFromFS

> ```js
> serveFromFS(res: node:http.ServerResponse, filePath: string, statusCode: number = 200): void
> ```

### getBodyJSON

> ```js
> getBodyJSON(req: node:http.IncomingMessage) Promise<{json: Object|null, err: Object|null}>
> ```

> ```js
> app.put('/json/echo', (req, res, _) => {
>   let { json, err } = getBodyJSON(req);
>   if (err) return buildRes(res, `invalid JSON: ${err}`, { code: 400, mime: 'text/plain' });
>   buildRes(res, json, { mime: 'application/json' });
> });
> ```

Here `app` is the [EZServer instance](#app).
Here `json` is the Object returned by JSON.parse() if successful, otherwise null.
Here `err` is the Error that was thrown by JSON.parse if unsuccessful, otherwise null.

If a request's body has json data `getBodyJson` parses and returns it asynchronously.

### throw404

> ```js
> throw404(req: node:http.IncomingMessage, res: node:http.ServerResponse): void
> ```

> ```js
> app.get('/404', (req, res, _) => throw404(req, res));
> ```

Here `app` is the [EZServer instance](#app).

Resolves the request by sending a 404 html-string.

### HTTP_METHODS

> ```js
> const { GET: 'GET', HEAD: 'HEAD', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', CONNECT: 'CONNECT', OPTIONS: 'OPTIONS', TRACE: 'TRACE', PATCH: 'PATCH' }
> ```

> ```js
> app.addRestRoute(HTTP_METHODS.GET, '/get', (_, res, _) => {
>   buildRes(res, "triggered '/get' fot HTTP method 'GET'");
> });
> ```

Here `app` is the [EZServer instance](#app).

HTTP_METHODS is designed to be used for specifying HTTP methods.
This also provides auto-completion in most code-editors or IDEs.
