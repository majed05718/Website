module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './api',
      script: 'dist/main.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',  // ✅ قيمة قياسية
        PORT: 3031,
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'frontend',
      cwd: './Web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8088',  // البورت المطلوب
      instances: 1,
      env: {
        NODE_ENV: 'production',  // ✅ قيمة قياسية (وليس staging)
        PORT: 8088,
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
