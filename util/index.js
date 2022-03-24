const { spawn } = require("child_process");
const toThenable = require("2-thenable");
const portfinder = require("portfinder");

const PRODUCTION = process.env.NODE_ENV === "production";
const DEVELOPMENT = !PRODUCTION;

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

function waitUntilResolved(promise) {
  return async function (req, res, next) {
    await promise;
    next();
  };
}

async function getPort(start) {
  return portfinder.getPortPromise({
    port: start,
    stopPort: start + 100,
  });
}

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
