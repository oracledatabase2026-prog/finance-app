# 🚀 FinanceOS Deployment Guide

Complete deployment instructions for production environments.

## 📋 Pre-Deployment Checklist

- [ ] Update all environment variables
- [ ] Change default passwords and JWT secrets
- [ ] Configure database backup strategy
- [ ] Setup monitoring and logging
- [ ] Configure SSL/TLS certificates
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Configure CDN (if applicable)

## 🐳 Docker Production Deployment

### 1. Prepare Environment

```bash
# Clone repository
git clone <your-repo-url>
cd financeos

# Create production environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit with production values
nano backend/.env
nano frontend/.env.local
```

### 2. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data (optional)
docker-compose exec backend npm run prisma:seed
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose ps

# Test API health
curl http://localhost:4000/api/v1/health

# Test frontend
curl http://localhost:3000
```

## ☁️ Cloud Platform Deployments

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

**Environment Variables in Vercel:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

### Railway (Backend + Database)

1. **Create Railway account** at railway.app
2. **New Project** → Deploy from GitHub
3. **Add PostgreSQL** service
4. **Configure environment variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-production-secret-key
   JWT_REFRESH_SECRET=your-production-refresh-secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   PORT=4000
   ```
5. **Deploy** - Railway auto-deploys on git push

### Render (Backend)

1. **New Web Service** → Connect repository
2. **Build Command:** `cd backend && npm install && npx prisma generate && npm run build`
3. **Start Command:** `cd backend && npm run start:prod`
4. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

### DigitalOcean App Platform

```yaml
# app.yaml
name: financeos
services:
  - name: backend
    github:
      repo: your-username/financeos
      branch: main
      deploy_on_push: true
    source_dir: /backend
    build_command: npm install && npx prisma generate && npm run build
    run_command: npm run start:prod
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: JWT_SECRET
        type: SECRET
      - key: JWT_REFRESH_SECRET
        type: SECRET
    
  - name: frontend
    github:
      repo: your-username/financeos
      branch: main
    source_dir: /frontend
    build_command: npm install && npm run build
    run_command: npm start
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: ${backend.PUBLIC_URL}/api/v1

databases:
  - name: db
    engine: PG
    version: "16"
```

## 🗄️ Database Management

### Backup Strategy

```bash
# Automated daily backups
crontab -e

# Add:
0 2 * * * docker exec financeos-db pg_dump -U postgres financeos > /backups/financeos-$(date +\%Y\%m\%d).sql
```

### Manual Backup

```bash
# Export database
docker exec financeos-db pg_dump -U postgres financeos > backup.sql

# Import database
docker exec -i financeos-db psql -U postgres financeos < backup.sql
```

### Migrations

```bash
# Production migration
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate
```

## 🔒 Security Hardening

### SSL/TLS Setup (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.financeos.com;

    ssl_certificate /etc/letsencrypt/live/api.financeos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.financeos.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

**NEVER commit these to git:**

```bash
# Backend Production .env
DATABASE_URL="postgresql://user:STRONG_PASSWORD@host:5432/financeos?sslmode=require"
JWT_SECRET="CHANGE_THIS_TO_RANDOM_64_CHAR_STRING"
JWT_REFRESH_SECRET="CHANGE_THIS_TO_DIFFERENT_64_CHAR_STRING"
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://app.financeos.com
```

Generate secure secrets:
```bash
# Linux/Mac
openssl rand -base64 64

# Or use online generator
# https://generate-secret.vercel.app/64
```

## 📊 Monitoring & Logging

### Setup Logging

```typescript
// backend/src/main.ts
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Health Checks

```typescript
// backend/src/health/health.controller.ts
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

### Monitoring Services

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **DataDog** - Infrastructure monitoring
- **Uptime Robot** - Uptime monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token=$VERCEL_TOKEN
```

## 📈 Performance Optimization

### Frontend

```typescript
// next.config.js
module.exports = {
  compress: true,
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};
```

### Backend

```typescript
// Enable compression
app.use(compression());

// Cache frequently accessed data
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100,
    }),
  ],
})
```

### Database

```sql
-- Add indexes for performance
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX idx_purchase_invoices_supplier ON purchase_invoices(supplier_id);
CREATE INDEX idx_stock_items_product ON stock_items(product_id);
```

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
docker exec financeos-db psql -U postgres -d financeos -c "SELECT 1;"
```

**Frontend can't reach backend**
```bash
# Check CORS settings
# backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

**Prisma Client not generated**
```bash
docker-compose exec backend npx prisma generate
```

### Log Analysis

```bash
# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# Frontend logs
docker-compose logs -f frontend
```

## 📞 Support

- 📧 Email: support@financeos.io
- 💬 Discord: https://discord.gg/financeos
- 🐛 GitHub Issues: https://github.com/financeos/issues

## ✅ Post-Deployment Verification

1. ✓ Frontend loads without errors
2. ✓ Can login with test credentials
3. ✓ Dashboard displays data
4. ✓ API responses are fast (<200ms)
5. ✓ Database backups are running
6. ✓ SSL certificate is valid
7. ✓ Monitoring alerts are configured
8. ✓ Error tracking is active

---

**Remember:** Always test deployments in staging before production!
