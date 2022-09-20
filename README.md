# EZServer

<span style="color: #ff2020">EZServer versions prior to 2.0.0 are _very_ deprecated and not `'stable'` or `'production-ready'`<span>

simple, ultra light weight node.js module with 0 dependencies for simple backend/REST-API development

> EZServer is developed on the current node version (v18)
> but should run on all active LTS versions

## Resolving reqests
To resolve a request simply use the 'add' function of the app.
Eg. to resolve the request '/myrequest', respond with 'Hello World!' and the status code '200' do the following:
```js
const { App, buildRes } = require('ezserver');

const app = new App();

app.add('/myrequest', (req, res) => {
    buildRes(res, 'Hello World!', {
        code: 200
    });
});

app.listen(8080);
```


> for further documentation & examples refer to [`example/index.js`](https://github.com/peter-schweitzer/EZServer/blob/master/example/index.js)

