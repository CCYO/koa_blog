#!/usr/bin/env node
/**
 * Module dependencies.
 */

const http = require("http");
const app = require("../app");

const { ENV } = require("../config");
const port = normalizePort(process.env.NODE_PORT);

/**
 * Create HTTP server.
 */

let server;

// SSL交由NGINX負責
// if (ENV.isProd) {
//   server = https.createServer(
//     {
//       key: readFileSync(resolve(__dirname, "../_config/ssl/private.key")),
//       cert: readFileSync(resolve(__dirname, "../_config/ssl/certificate.crt")),
//       ca: readFileSync(resolve(__dirname, "../_config/ssl/ca_bundle.crt")),
//     },
//     app.callback()
//   );
// } else {
server = http.createServer(app.callback());
// }

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log(`ENV IS ${ENV.MODE}`);
  console.log(`LISTEN on ${bind}`);
}
