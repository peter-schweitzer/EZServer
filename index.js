const { App, serveFromFS, buildRes, getType } = require('./src/EZServer');
const { getBodyJSON } = require('./src/endpoints/REST');

module.exports = { App, serveFromFS, buildRes, getType, getBodyJSON };

