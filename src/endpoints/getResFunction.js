/**
 * @param {import('http').IncomingMessage} req request from the client
 * @param {import('./index.js').resolvers} resolvers the array of endpoints to traverse
 * @returns {(import('./index.js').resFunction|false)} resFunction function to resolve request
 */
function getResFunction(req, resolvers) {
  let ss = req.url.split('/');
  while (ss.length > 0)
    if (!!resolvers['/' + ss.join('/')]) break;
    else ss.pop();

  return resolvers['/' + ss.join('/')] || false;
}

module.exports = { getResFunction };

