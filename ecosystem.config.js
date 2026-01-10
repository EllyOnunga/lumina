/* eslint-disable no-undef */
module.exports = {
    apps: [{
        name: 'lumina-marketplace',
        script: 'dist/index.cjs',
        instances: 'max', // Use all available CPU cores
        exec_mode: 'cluster', // Cluster mode for load balancing
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        max_memory_restart: '1G', // Restart if memory exceeds 1GB
        autorestart: true,
        watch: false,
        max_restarts: 10,
        min_uptime: '10s',
        listen_timeout: 10000,
        kill_timeout: 5000,
        wait_ready: true,
        // Environment-specific settings
        env_production: {
            NODE_ENV: 'production'
        },
        env_development: {
            NODE_ENV: 'development'
        }
    }]
};
