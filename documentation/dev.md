# Development

## definitions

definitions
|-[specificity](#specificity)
|-[resolver](#resolver)
|-[resFunction](#resFunction)
|-[endpoint](#resolver)
'-[route](#resFunction)

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
|-_**[generic functions:](#generic-functions)**_
| |-[addGenericRestFunction](#addGenericRestFunction)
| |-[useGenericRestFunction](#useGenericRestFunction)
| |-[addGenericFunction](#addGenericFunction)
| '-[useGenericFunction](#useGenericFunction)
|
'-_**[internals](#internals)**_

### Internals

The underlying `node:http.Server` instance:

> ```js
> const { createServer } = require('node:http');
> m_http_server = createServer();
> ```

The data structure for storing endpoints:

> ```js
> m_rest_endpoints;
> m_endpoints;
> ```

The data structure for storing endpoints with params:

> ```js
> m_rest_endpoints_with_params;
> m_endpoints_with_params;
> ```

The data structure for storing routes:

> ```js
> m_rest_routes;
> m_routs;
> ```

The data structure for storing routes with params:

> ```js
> m_generic_rest_functions;
> m_generic_functions;
> ```
