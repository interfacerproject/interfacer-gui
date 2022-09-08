module.exports = {
  apps: [
    {
      name: 'interfacer-gui',
      time: true,
      autorestart: true,
      max_restarts: 50,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      exec_mode: "cluster",
      instances: 0,
      listen_timeout: 12000,
      wait_ready: true,
      watch: false,
      env: {
        PORT: 3040,
      },
    },
  ],
  deploy: {
    baloo: {
      host: 'deploy_staging',
      ref: 'origin/stagin-deploy',
      repo: 'https://github.com/dyne/interfacer-gui',
      path: '/root/interfacer-gui',
      'post-deploy': 'sh deploy.sh',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
}
