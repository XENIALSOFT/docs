```js
module.exports = {
  apps: [
    {
      name: 'admin',
      cwd: '/var/www/admin',
      script: './.output/server/index.mjs',
      env: { PORT: 4000 },
      exec_mode: 'cluster',
      instances: 'max',
      interpreter: 'node',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'api',
      cwd: '/var/www/api',
      script: 'java',
      args: '-Xms512m -Xmx768m -jar api-0.0.1-SNAPSHOT.jar --server.port=8080 --spring.profiles.active=production',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M'
    },
    {
      name: 'web',
      cwd: '/var/www/web',
      script: './.output/server/index.mjs',
      env: { PORT: 3000 },
      exec_mode: 'cluster',
      instances: 'max',
      interpreter: 'node',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
  ]
}
```