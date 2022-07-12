const { getBodyJSON } = require('./src/endpoints/REST');
const { App, serveFromFS, buildRes, getType } = require('./src/EZServer');

module.exports = { App, serveFromFS, buildRes, getType, getBodyJSON };

