// PM2 config
module.exports = {
  apps: [
    {
      name: "koa_blog",
      script: "./server/bin/www.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
