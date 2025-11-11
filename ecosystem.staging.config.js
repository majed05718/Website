module.exports = {
  apps: [
    {
      name: 'staging-api',
      script: './dist/main.js',
      cwd: './api',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
    },
    {
      name: 'staging-frontend',
      script: 'npm',
      args: 'start',
      cwd: './Web',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
      },
    },
  ],
};
