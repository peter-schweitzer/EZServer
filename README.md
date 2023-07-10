# EZServer

<span style="color: #ff2020">EZServer versions prior to `3.0.3` are no longer available! version 3.0.6 (or newer) is recommended</span>

simple, ultra light weight node.js module with 0 dependencies for simple backend/REST-API development

> EZServer is developed on the current node version (v20)
> but should run on all active LTS versions

## Resolving requests

The most basic way of resolving a request is using the 'add' function of the app.
Eg. to resolve a request to `/myRequest` and respond with `Hello World!` do the following:

```js
import { App, buildRes } from '@peter-schweitzer/ezserver';

const app = new App();

app.add('/hello-world', (req, res) => {
  buildRes(res, 'Hello, World!');
});

app.listen(8080);
```

on `localhost:8080/hello-world` you should see the text "Hello, World!"

The `req`-Object is passed from the node:http server, but is slightly modified.<br>
EZServer adds the property `uri`, which is very similar to req.url, but URI-decoded and <i style="color: #ff2020">without</i> a query string.<br>
To provide correct type annotations for the `req`-Object the `EZIncomingMessage` type is used.

> for further documentation refer to the [example](./example/index.js)
