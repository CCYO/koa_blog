const session = require("koa-generic-session");

const store = require("./store");

const middleware = session({
  //cookie name前綴
  key: "koa_blog.sid",
  //redis key前綴
  prefix: "koa_blog.sid:",
  store,
});

module.exports = middleware;
