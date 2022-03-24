const { resolve } = require("path");
const { run } = require("~/util");

const PRODUCTION = process.env.NODE_ENV === "production";

const runOptions = {
  cwd: resolve(__dirname, ".."),
};
const serverFile = resolve(__dirname, "server.js");

(async function main() {
  console.log("Starting application…");
  
  if (PRODUCTION) {
    run("npx", ["node", serverFile], runOptions);
  } else {
    run("npx", ["node", "--inspect", serverFile], runOptions);
  }
})();
