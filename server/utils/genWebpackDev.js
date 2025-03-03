//  解法來自 https://github.com/yiminghe/koa-webpack-dev-middleware/pull/27

"use strict";

/* NPM         ----------------------------------------------------------------------------- */
const expressMiddleware = require("webpack-dev-middleware");

function middleware(doIt, req, res) {
  const { end: originalEnd } = res;

  return new Promise((resolve) => {
    res.end = function end() {
      originalEnd.apply(this, arguments);
      resolve(0);
    };
    doIt(req, res, () => {
      resolve(1);
    });
  });
}

function genWebpackDevMiddleware(compiler, option) {
  const doIt = expressMiddleware(compiler, option);

  async function koaMiddleware(ctx, next) {
    const { req } = ctx;
    const locals = ctx.locals || ctx.state;

    ctx.webpack = doIt;

    const runNext = await middleware(doIt, req, {
      end(content) {
        ctx.body = content;
      },
      locals,
      setHeader() {
        ctx.set.apply(ctx, arguments);
      },
      getHeader() {
        ctx.get.apply(ctx, arguments);
      },
    });

    if (runNext) {
      await next();
    }
  }

  Object.keys(doIt).forEach((p) => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
}

module.exports = genWebpackDevMiddleware;
