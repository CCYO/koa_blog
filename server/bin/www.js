#!/usr/bin/env node
/**
 * Module dependencies.
 */

const http = require("http");
const https = require("https");
const { readFileSync } = require("fs");

const app = require("../app");
const _ws = require("./ws");
const { log } = require("../utils/log");
const { ENV } = require("../config");

const port = normalizePort(process.env.NODE_PORT);

/**
 * Create HTTP server.
 */

let server;
if (ENV.isProd) {
  server = https.createServer(
    {
      key: readFileSync("/etc/letsencrypt/live/ccyo.work/privkey.pem"),
      cert: readFileSync("/etc/letsencrypt/live/ccyo.work/cert.pem"),
      ca: readFileSync("/etc/letsencrypt/live/ccyo.work/chain.pem"),
    },
    app.callback()
  );
} else {
  server = http.createServer(app.callback());
}

_ws(server, app);
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
  log(`ENV IS ${process.env.NODE_ENV}`);
  log(`LISTEN on ${bind}`);
}
