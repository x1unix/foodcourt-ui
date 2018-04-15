const httpProxy = require('http-proxy');
const http = require('http');
const config = require('../proxy.json');

const proxy = httpProxy.createProxyServer({});
const target = config.target;
const prettyUrl = `http://localhost:${config.port}`;

console.info(`Foodcourt API proxy started at ${prettyUrl}`);
console.info(`Proxying ${prettyUrl} => ${config.target}`);

http.createServer((req, res) => {
  console.log(`> ${req.method} ${req.url}`);
  proxy.web(req, res, {target});

  // Patch response header
  res.setHeader('Access-Control-Allow-Origin', '*');
}).listen(port);

proxy.on('error', (err) => console.error(err));
