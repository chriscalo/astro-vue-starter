const { resolve } = require("path");
const config = require("config");
const express = require("express");
const chalk = require("chalk");
const { listen } = require("~/util");

const PRODUCTION = process.env.NODE_ENV === "production";

const server = express();

server.use(loggingMiddleware());
server.use(uiMiddleware());
server.use(apiMiddleware());


(async function main() {
  const port = config.get("port");
  const { url } = await listen(server, port); 
  console.log(
    chalk`${ chalk.bold.inverse.green(" Application ") } server running:`,
    chalk.yellow.bold(url),
  );
})();

function loggingMiddleware() {
  const { performance } = require("perf_hooks");
  return function loggingMiddleware(req, res, next) {
    const time = new Date().toISOString();
    const start = performance.now();
    const { method, path } = req;
    res.on("finish", function () {
      const end = performance.now();
      const duration = `${(end - start).toFixed()}ms`;
      const { statusCode } = res;
      console.log(`${time} ${method} ${path} ${statusCode} ${duration}`);
    });
    next();
  };
}

function apiMiddleware() {
  let apiMiddleware = require("~/api");
  
  if (!PRODUCTION) {
    const hmr = require("node-hmr");
    hmr(function () {
      apiMiddleware = require("~/api");
      console.log("[HMR] Reloaded API");
    }, {
      watchDir: resolve(__dirname, "../api"),
      watchFilePatterns: ["**/*.js"],
    });
  }
  
  return function (req, res, next) {
    apiMiddleware(req, res, next);
  };
}

function uiMiddleware() {
  const uiMiddleware = require("~/ui");
  return function (req, res, next) {
    uiMiddleware(req, res, next);
  };
}
