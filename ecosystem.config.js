// PM2 config
module.exports = {
  apps: [
    {
      name: "koa_blog",
      script: "./server/bin/www",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
