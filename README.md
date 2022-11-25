# EZServer

<span style="color: #ff2020">EZServer versions prior to 2.0.0 are _very_ deprecated and not `'stable'` or `'production-ready'`<span>

simple, ultra light weight node.js module with 0 dependencies for simple backend/REST-API development

> EZServer is developed on the current node version (v19)
> but should run on all active LTS versions

## Resolving requests

The most basic way of resolving a request is using the 'add' function of the app.
Eg. to resolve a request to `/myRequest` and respond with `Hello World!` do the following:

```js
const { App, buildRes } = require('@peter-schweitzer/ezserver');

const app = new App();

app.add('/myRequest', (req, res) => {
  buildRes(res, 'Hello World!');
});

app.listen(8080);
```

The `req`-Object is passed from the node:http server, but is slightly modified.<br>
EZServer adds`req.uri`, which is very similar to req.url, but URI-decoded and <i style="color: #ff2020">without</i> a query string.<br>

> for further documentation & examples refer to the [documentation-folder](https://github.com/peter-schweitzer/EZServer/blob/master/documentation) and the [example](https://github.com/peter-schweitzer/EZServer/blob/master/example/index.js)
