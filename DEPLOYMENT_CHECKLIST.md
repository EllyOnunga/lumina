# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

Use this checklist to ensure a smooth production deployment.

---

## ✅ PRE-DEPLOYMENT (Complete Before Going Live)

### **1. Code & Dependencies**

- [ ] All code committed to version control
- [ ] `npm audit` run and critical vulnerabilities fixed
- [ ] `npm run lint` passes with no errors
- [ ] `npm run test` passes all unit tests
- [ ] `npm run test:e2e` passes all E2E tests
- [ ] `npm run build` completes successfully
- [ ] All environment variables documented in `.env.example`

### **2. Database**

- [ ] Production PostgreSQL database provisioned
- [ ] `DATABASE_URL` configured in `.env`
- [ ] Database migrations run (`npm run db:push`)
- [ ] Database backups configured
- [ ] Database connection pooling tested
- [ ] Initial admin user created

### **3. Environment Configuration**

- [ ] `.env` file created with production values
- [ ] `NODE_ENV=production` set
- [ ] `SESSION_SECRET` generated (32+ random bytes)
- [ ] `ALLOWED_ORIGINS` set to production domain(s)
- [ ] `APP_URL` set to production URL
- [ ] All API keys use LIVE/PRODUCTION credentials

### **4. Payment Gateways**

- [ ] Stripe live keys configured
- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook secret added to `.env`
- [ ] PayPal production credentials configured
- [ ] PayPal mode set to `live`
- [ ] M-PESA production credentials configured (if applicable)
- [ ] Test transactions completed in sandbox mode
- [ ] Payment webhooks tested

### **5. OAuth Providers**

- [ ] Google OAuth app created
- [ ] Google OAuth credentials added to `.env`
- [ ] Google OAuth callback URL configured
- [ ] GitHub OAuth app created
- [ ] GitHub OAuth credentials added to `.env`
- [ ] GitHub OAuth callback URL configured
- [ ] OAuth login tested

### **6. Email Service**

- [ ] Email service account created (SendGrid/AWS SES/Gmail)
- [ ] SMTP credentials added to `.env`
- [ ] `EMAIL_FROM` address configured
- [ ] Test email sent successfully
- [ ] Welcome email template tested
- [ ] Order confirmation email template tested

### **7. Security**

- [ ] SSL certificate installed
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured (Helmet)
- [ ] CORS configured with production origins
- [ ] CSRF protection enabled and tested
- [ ] Rate limiting configured
- [ ] Firewall rules configured
- [ ] No secrets in code (all in environment variables)
- [ ] Session cookies set to `secure: true`

### **8. Server Setup**

- [ ] Server/VPS provisioned
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Nginx installed and configured
- [ ] PM2 installed globally
- [ ] Application deployed to server
- [ ] Dependencies installed (`npm ci --production`)
- [ ] Application built (`npm run build`)

### **9. Process Management**

- [ ] PM2 configured (`ecosystem.config.js`)
- [ ] Application started with PM2
- [ ] PM2 startup script configured
- [ ] PM2 process saved
- [ ] Log rotation configured
- [ ] Application auto-restarts on crash

### **10. Monitoring & Logging**

- [ ] Health check endpoint accessible (`/api/health`)
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Error tracking configured (Sentry - optional)
- [ ] Analytics configured (Google Analytics - optional)
- [ ] Server logs accessible
- [ ] Application logs accessible
- [ ] Alert notifications configured

---

## 🧪 TESTING (Complete Before Launch)

### **Functional Testing**

- [ ] Homepage loads correctly
- [ ] Product listing page works
- [ ] Product detail page works
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Add to cart works
- [ ] Cart page displays correctly
- [ ] Wishlist works
- [ ] Guest checkout works
- [ ] User registration works
- [ ] User login works (local)
- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] Password reset works
- [ ] Email verification works
- [ ] Order placement works
- [ ] Payment processing works (all methods)
- [ ] Order confirmation email received
- [ ] Admin dashboard accessible
- [ ] Admin can manage products
- [ ] Admin can manage orders
- [ ] Admin can manage users

### **Payment Testing**

- [ ] Stripe payment successful
- [ ] Stripe payment failure handled
- [ ] PayPal payment successful
- [ ] PayPal payment failure handled
- [ ] M-PESA payment successful (if applicable)
- [ ] M-PESA payment failure handled (if applicable)
- [ ] Webhook processing works
- [ ] Order status updates correctly
- [ ] Payment status updates correctly

### **Performance Testing**

- [ ] Lighthouse score 90+ (Performance)
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Images optimized
- [ ] Compression enabled (gzip/brotli)
- [ ] CDN configured (optional)

### **Security Testing**

- [ ] HTTPS working
- [ ] CSRF protection working
- [ ] Rate limiting working
- [ ] SQL injection prevention tested
- [ ] XSS prevention tested
- [ ] Session security tested
- [ ] OAuth security tested

### **Cross-Browser Testing**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### **Responsive Testing**

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

---

## 📋 POST-DEPLOYMENT (Complete After Launch)

### **Immediate (Within 1 Hour)**

- [ ] Verify homepage loads
- [ ] Test complete checkout flow
- [ ] Test OAuth login
- [ ] Check error logs for issues
- [ ] Verify email sending works
- [ ] Test payment processing
- [ ] Check database connections
- [ ] Verify SSL certificate

### **First Day**

- [ ] Monitor server resources (CPU, RAM, Disk)
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Test all critical user flows
- [ ] Monitor uptime

### **First Week**

- [ ] Review analytics
- [ ] Check for errors in logs
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check payment success rates
- [ ] Verify backup system working
- [ ] Review security logs

### **First Month**

- [ ] Performance optimization based on metrics
- [ ] Security audit
- [ ] Database optimization
- [ ] Review and optimize costs
- [ ] Plan scaling strategy
- [ ] User feedback analysis

---

## 🔧 DEPLOYMENT COMMANDS

### **Build Application**

```bash
npm ci --production
npm run build
```

### **Start with PM2**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/lumina
sudo ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **SSL Certificate**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **Database Migration**

```bash
npm run db:push
```

### **Check Logs**

```bash
pm2 logs lumina-marketplace
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🚨 ROLLBACK PLAN

If something goes wrong:

1. **Stop Application**

   ```bash
   pm2 stop lumina-marketplace
   ```

2. **Restore Previous Version**

   ```bash
   git checkout <previous-commit>
   npm ci --production
   npm run build
   ```

3. **Restart Application**

   ```bash
   pm2 restart lumina-marketplace
   ```

4. **Restore Database** (if needed)

   ```bash
   psql -U user -d database < backup.sql
   ```

---

## 📞 EMERGENCY CONTACTS

- **Server Provider**: [Provider Support]
- **Database Provider**: [Database Support]
- **Payment Gateway**: [Stripe/PayPal Support]
- **Email Service**: [SendGrid/SES Support]
- **Domain Registrar**: [Domain Support]

---

## ✅ FINAL CHECKLIST

Before announcing launch:

- [ ] All tests passing
- [ ] All monitoring configured
- [ ] All backups configured
- [ ] All documentation updated
- [ ] Team trained on admin panel
- [ ] Support channels ready
- [ ] Marketing materials ready
- [ ] Legal pages updated (Terms, Privacy)
- [ ] GDPR compliance (if applicable)
- [ ] Accessibility tested
- [ ] SEO optimized

---

**🎉 READY TO LAUNCH!**

Once all items are checked, you're ready to go live!

---

**Last Updated**: 2026-01-10  
**Version**: 1.0.0
