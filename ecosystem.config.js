module.exports = {
  apps: [
    {
      name: 'dev-api',
      script: './dist/main.js', // المسار النسبي من cwd
      cwd: './api', // <-- أهم سطر: حدد مجلد العمل هنا
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dev-frontend',
      script: 'npm',
      args: 'start', // <-- سنضع البورت في package.json
      cwd: './Web', // <-- أهم سطر: حدد مجلد العمل هنا
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
