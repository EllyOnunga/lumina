# Lumina E-Commerce - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ database
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Payment gateway accounts (Stripe, PayPal, M-PESA)

---

## 1. Environment Configuration

Create a `.env` file with production values:

```bash
# Environment
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Security
SESSION_SECRET=<generate-strong-random-secret>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=<production-client-id>
PAYPAL_CLIENT_SECRET=<production-secret>
PAYPAL_MODE=live

# M-PESA (Safaricom)
MPESA_CONSUMER_KEY=<consumer-key>
MPESA_CONSUMER_SECRET=<consumer-secret>
MPESA_SHORTCODE=<business-shortcode>
MPESA_PASSKEY=<lipa-na-mpesa-passkey>
MPESA_CALLBACK_URL=https://yourdomain.com/api/payment/mpesa/callback

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Monitoring
SENTRY_DSN=<sentry-dsn>
```

**Generate SESSION_SECRET**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. Database Setup

### Run Migrations

```bash
npm run db:push
```

### Seed Initial Data (Optional)

```bash
npm run seed
```

### Database Optimization

1. **Enable Connection Pooling** (already configured in code)
2. **Create Indexes** for frequently queried columns:

```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

1. **Set up automated backups**:

```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -U user database > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 3. Build Application

```bash
npm install --production=false
npm run build
```

This will:

- Build the frontend (optimized, minified, code-split)
- Build the backend
- Generate service worker
- Optimize assets

---

## 4. Server Configuration

### Option A: PM2 (Recommended)

Install PM2:

```bash
npm install -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'lumina',
    script: 'dist/index.cjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G'
  }]
};
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Monitor:

```bash
pm2 monit
pm2 logs
```

### Option B: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: lumina
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:

```bash
docker-compose up -d
```

---

## 5. Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/lumina`:

```nginx
upstream lumina_backend {
    least_conn;
    server 127.0.0.1:5000;
    # Add more servers for load balancing
    # server 127.0.0.1:5001;
    # server 127.0.0.1:5002;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://lumina_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker (no cache)
    location = /sw.js {
        proxy_pass http://lumina_backend;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Manifest
    location = /manifest.json {
        proxy_pass http://lumina_backend;
        add_header Cache-Control "public, max-age=86400";
    }

    # API and dynamic content
    location / {
        proxy_pass http://lumina_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://lumina_backend;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 7. Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 8. Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring**:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

1. **Health Checks**:

```bash
# Add to cron
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed"
```

1. **External Monitoring** (Optional):

- UptimeRobot
- Pingdom
- New Relic
- DataDog

### Log Management

```bash
# Rotate logs
sudo nano /etc/logrotate.d/lumina
```

```log
/var/log/lumina/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## 9. Performance Optimization

### CDN Setup (CloudFlare)

1. Add domain to CloudFlare
2. Update nameservers
3. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - Caching rules

### Database Optimization1

```sql
-- Analyze and vacuum regularly
ANALYZE;
VACUUM ANALYZE;

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## 10. Security Hardening

### Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

### Application Security

- [x] HTTPS enforced
- [x] Security headers (Helmet)
- [x] Rate limiting
- [x] CSRF protection
- [x] Input sanitization
- [x] SQL injection prevention (Drizzle ORM)
- [x] XSS protection
- [x] Session security

---

## 11. Payment Gateway Configuration

### Stripe

1. Set up webhooks: `https://yourdomain.com/api/payment/stripe/webhook`
2. Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Test with Stripe CLI before production

### PayPal

1. Switch to live credentials
2. Configure webhook: `https://yourdomain.com/api/payment/paypal/webhook`
3. Test in sandbox first

### M-PESA

1. Register callback URL with Safaricom
2. Test with sandbox credentials
3. Go live with production credentials

---

## 12. Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# /usr/local/bin/backup-lumina.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/lumina"

# Database backup
pg_dump -U user database | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/lumina/uploads

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

# Upload to S3 (optional)
aws s3 sync $BACKUP_DIR s3://your-bucket/backups/
```

Add to cron:

```bash
0 2 * * * /usr/local/bin/backup-lumina.sh
```

---

## 13. Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Nginx, HAProxy, or AWS ALB
2. **Multiple App Instances**: PM2 cluster mode or Docker Swarm
3. **Database Replication**: PostgreSQL read replicas
4. **Session Store**: Redis for distributed sessions
5. **File Storage**: S3 or CDN for uploads

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable database connection pooling
- Use caching (Redis)

---

## 14. Post-Deployment

### Verify Deployment

```bash
# Health check
curl https://yourdomain.com/api/health

# Test endpoints
curl https://yourdomain.com/api/products
curl https://yourdomain.com/api/categories

# Check SSL
curl -I https://yourdomain.com

# Test PWA
# Open in browser and check:
# - Service worker registered
# - Manifest loaded
# - Install prompt appears
```

### Monitor First 24 Hours

- Check error logs
- Monitor response times
- Watch database performance
- Verify payment webhooks
- Test checkout flow

---

## 15. Maintenance

### Regular Tasks

- **Daily**: Check logs, monitor errors
- **Weekly**: Review performance metrics, check backups
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Load testing, disaster recovery drill

### Update Process

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run db:push

# Build
npm run build

# Restart with zero downtime
pm2 reload lumina
```

---

## Support & Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if app is running (`pm2 status`)
2. **Database connection failed**: Verify DATABASE_URL
3. **Payment webhook failed**: Check webhook signatures
4. **High memory usage**: Restart app, check for memory leaks

### Logs Location

- Application: `/var/log/lumina/`
- Nginx: `/var/log/nginx/`
- PM2: `~/.pm2/logs/`

---

## Emergency Contacts

- **Hosting Provider**: [contact]
- **Database Admin**: [contact]
- **Payment Support**: Stripe, PayPal, Safaricom
- **SSL Provider**: Let's Encrypt

---

**Last Updated**: 2026-01-10  
**Version**: 1.0.0
