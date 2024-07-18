module.exports = {
  apps: [
    {
      name: "app",
      script: "./server/bin/www",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
