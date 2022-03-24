const config = require("config");
const express = require("express");
const proxy = require("express-http-proxy");
const nocache = require("nocache");
const PRODUCTION = process.env.NODE_ENV === "production";

const server = express();

server.use(PRODUCTION ? prodServer() : devServer());

function devServer() {
  const { getPort, killPort, waitUntilResolved } = require("~/util");
  const server = express();
  const portPromise = getPort(3000);
  
  server.use(nocache());
  server.use(waitUntilResolved(portPromise));
  portPromise.then(port => {
    server.use(proxyPortWithFallthrough(port, { ws: true }));
    killPort(port);
    astroServer({ port });
  });
  
  return server;
}

function astroServer({ port }) {
  const { run } = require("~/util");
  console.log("Starting Astro dev server…");
  const astro = run("npx", `astro dev --port=${port}`, { cwd: __dirname });
}

function prodServer() {
  const { resolve } = require("path");
  const server = express();
  const distDir = resolve(__dirname, "dist");
  server.use(express.static(distDir));
  return server;
}

function proxyPortWithFallthrough(port, options) {
  const defaultOptions = {
    // when no handler found, pass through to rest of middleware stack
    skipToNextHandlerFilter(res) {
      return res.statusCode === 404;
    },
  };
  return proxy(`localhost:${port}`, {
    ...defaultOptions,
    ...options,
  });
}

module.exports = server;
