# astro-vue-starter

This starter includes the following components:

- express server
- basic logging middleware
- API middleware with hot reloading (see [/api](./api) directory)
- proxied Astro UI with Vue 3 (with HMR in dev and fully static in production)

## Get started

1. clone this repo
2. run `npm install`
3. run `npm start` (optionally, specify a port: `PORT=4000 npm start`)
4. open [localhost:8080](http://localhost:8080) (or the port you specified)

## Build and deploy

1. run `npm build`, which will create a fully static `ui/dist` directory
2. deploy the entire project directory to a Node.js server (not just `ui/dist`)
3. in production, run `npm start`, ensuring the environment variable
   `NODE_ENV=production` is set
