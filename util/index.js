// Common utilities for running an application and web server

const { spawn } = require("child_process");
const toThenable = require("2-thenable");
const portfinder = require("portfinder");

const PRODUCTION = process.env.NODE_ENV === "production";
const DEVELOPMENT = !PRODUCTION;

// Given a string `command` and an `args` string or array, starts a new process
// with that `command` and `args`. By default, tries to pipe `stdin`, `stdout`,
// and `stderr` to/from the process where `run()` was called and tries to any
// colors in the output are preserved. Returns a promise-like object that, when
// the process exits, resolves to an object containing the exit `code`, the
// `signal` used to terminate the process, and the complete `stdout` and
// `stderr` output. The promise rejects when there's an error.
function run(command, args = [], options = {}) {
  let stdout = "";
  let stderr = "";
  
  if (typeof args === "string") {
    args = args.split(" ");
  }
  
  const child = spawn(command, args, {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      FORCE_COLOR: true,
    },
    ...options,
  });
  
  if (child.stdout) {
    child.stdout.setEncoding("utf-8");
    child.stdout.on("data", data => stdout += data);
    child.stdout.pipe(process.stdout);
  }
  
  if (child.stderr) {  
    child.stderr.setEncoding("utf-8");
    child.stderr.on("data", data => stderr += data);
    child.stderr.pipe(process.stderr);
  }
  
  return toThenable(child, new Promise((resolve, reject) => {
    child.on("close", (code, signal) => {
      resolve({
        code,
        signal,
        stdout,
        stderr,
      });
    })
    child.on("error", reject);
  }));
}

// Returns an express middleware handler that waits until the provided `promise`
// resolves and then passes along to later middleware by calling `next()`.
function waitUntilResolved(promise) {
  return async function (req, res, next) {
    await promise;
    next();
  };
}

// Finds an available port starting at `start`
async function getPort(start) {
  return portfinder.getPortPromise({
    port: start,
    stopPort: start + 100,
  });
}

// Given an express `app` and a `port`, starts a server and returns a promise
// for an object containing the `url` and `port`. In dev, kills any process
// running on `port` before starting the server.
async function listen(app, port) {
  // this is slow, so only do it during local development
  if (DEVELOPMENT) {
    await killPort(port);
  }
  return new Promise((resolve, reject) => {
    const listener = app.listen(port, "localhost", function () {
      const { port } = listener.address();
      const url = `http://localhost:${port}`;
      resolve({
        url,
        port,
      });
    });
  });
}

// Kills any process running on `port`.
async function killPort(port) {
  const killPort_ = require("kill-port");
  return killPort_(port);
}

module.exports = {
  getPort,
  waitUntilResolved,
  listen,
  killPort,
  run,
};
