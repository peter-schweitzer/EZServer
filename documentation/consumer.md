# consumer documentation

ezserver-package
|
|-[definitions](#definitions)
|-[App (main EZServer class)](#app)
|-[Parameters](#parameters)
'-[utils](#utils)

## definitions

definitions
|-[resolver](#resolver)
|-[resFunction](#resFunction)
|-[endpoint](#resolver)
'-[route](#resFunction)

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

### specificity

the specificity of an URI decides the order of look up
the order is

specificity: rest endpoint > endpoint > rest endpoint with route param(s) > endpoint with route param(s) > rest route > route

<!---->

## App

App - main class of EZServer
|
|_**[application life time:](#application-life-time)**_
| |-[constructor](#constructor)
| |-[listen](#listen)
| '-[close](#close)
|
|-_**[endpoints:](#endpoints)**_
| |-[get](#get)
| |-[head](#head)
| |-[post](#post)
| |-[put](#put)
| |-[delete](#delete)
| |-[connect](#connect)
| |-[options](#options)
| |-[trace](#trace)
| |-[patch](#patch)
| '-[add](#add)
|
|-_**[routs:](#routs)**_
| |-[addRestRoute](#addRestRoute)
| '-[addRoute](#addRoute)
|
|
'-_**[generic functions:](#generic-functions)**_
&nbsp;|-[addGenericRestFunction](#addGenericRestFunction)
&nbsp;|-[useGenericRestFunction](#useGenericRestFunction)
&nbsp;|-[addGenericFunction](#addGenericFunction)
&nbsp;'-[useGenericFunction](#useGenericFunction)

```js
const { App } = require('@peter-schweitzer/ezserver'); // require App from EZServer
```

### application life time

#### constructor

```js
constructor(): void
```

```js
const app = new App();
```

Here `App` is the main EZServer class.
Here `const app` is the variable holding the newly instantiated EZServer-instance.

The constructor is called without any arguments.

#### listen

```js
listen(port: number|string): void
```

```js
app.listen(8080);
```

Here `app` is the EZServer-instance.

listen is basically a passthrough to the underlying node:http-Server-Instance
when called with a valid number or string the EZServer-instance will start handling requests

#### close

```js
close(): void
```

```js
app.close();
```

Here `app` is the [App](#app) instance.

close is basically a passthrough to the underlying node:http Server instance
when called (with no arguments) the Server-instance will stop handling requests
If an error occurs (this happens when the server is not open and close() is called) it will be logged, but not propagated.

### endpoints

#### get

```js
get(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.get('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered get-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'GET' and it is the most specific [resolver](#resolver).

#### head

```js
head(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.head('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered head-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'HEAD' and it is the most specific [resolver](#resolver).

#### post

```js
post(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.post('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered post-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'POST' and it is the most specific [resolver](#resolver).

#### put

```js
put(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.put('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered put-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'PUT' and it is the most specific [resolver](#resolver).

#### delete

```js
delete(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.delete('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered delete-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'DELETE' and it is the most specific [resolver](#resolver).

#### connect

```js
connect(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.connect('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered connect-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'CONNECT' and it is the most specific [resolver](#resolver).

#### options

```js
options(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.options('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered options-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'OPTIONS' and it is the most specific [resolver](#resolver).

#### trace

```js
trace(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.trace('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered trace-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'TRACE' and it is the most specific [resolver](#resolver).

#### patch

```js
patch(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.patch('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered patch-catchall');
});
```

Here `app` is the EZServer-instance.
The function is called if the http-method is 'PATCH' and it is the most specific [resolver](#resolver).

#### add

```js
add(route: string, fn: function(req: node:http.IncomingMessage, res: node:http.ServerResponse, parameters: Parameters) => void): boolean;
```

```js
app.add('/', (req, res, params) => {
  console.log(req.uri);
  buildRes(res, 'triggered catchall for all http methods');
});
```

Here `app` is the EZServer-instance.
The function is called regardless of HTTP method and if it is the most specific [resolver](#resolver).

### routs

#### addRestRoute

#### addRoute

### generic functions

#### addGenericRestFunction

#### useGenericRestFunction

#### addGenericFunction

#### useGenericFunction

<!---->

## Parameters

Parameters
|
|-[query](#query)
|-[queryInt](#queryInt)
|
|-[route](#route)
'-[routeInt](#routeInt)

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

utils
|
|-[buildRes](#buildRes)
|-[throw404](#throw404)
|-[getType](#getType)
|-[serveFromFS](#serveFromFS)
|-[getBodyJSON](#getBodyJSON)
|
'-[HTTP_METHODS](#http_methods)

### buildRes

```js
buildRes(res: node:http.ServerResponse, data: any, { code: ?number, mime: ?string }): void
```

### throw404

> ```js
> throw404(req: node:http.IncomingMessage, res: node:http.ServerResponse): void
> ```

> ```js
> app.get('/404', (req, res, param) => throw404(req, res));
> ```

Here `app` is the EZServer-instance.

Resolves the request by sending a 404 html-string.

### getType

> ```js
> getType(filePathOrName: string): string
> ```

Here `filePathOrName` should be the name of a file with a file ending (delimited by a '.')

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
> app.put('/json/echo', (req, res, params) => {
>   let { json, err } = getBodyJSON(req);
>   if (err) return buildRes(res, `invalid JSON: ${err}`, { code: 400, mime: 'text/plain' });
>   buildRes(res, json, { mime: 'application/json' });
> });
> ```

Here `app` is the EZServer-instance.
Here `json` is the Object returned by JSON.parse() if successful, otherwise null.
Here `err` is the Error that was thrown by JSON.parse if unsuccessful, otherwise null.

If a request's body has json data `getBodyJson` parses and returns it asynchronously.

### HTTP_METHODS

> ```js
> const { GET: 'GET', HEAD: 'HEAD', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', CONNECT: 'CONNECT', OPTIONS: 'OPTIONS', TRACE: 'TRACE', PATCH: 'PATCH' }
> ```

> ```js
> app.addRestRoute(HTTP_METHODS.GET, '/get', (req, res, param) => {
>   buildRes(res, "triggered '/get' fot HTTP method 'GET'");
> });
> ```

Here `app` is the EZServer-instance.

HTTP_METHODS is designed to be used for specifying HTTP methods.
This also provides auto-completion in most code-editors or IDEs.
