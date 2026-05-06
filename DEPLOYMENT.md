# 🚀 Deployment Guide - Career Intelligence Platform

This guide covers deploying the Career Intelligence Platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [ML Service Deployment](#ml-service-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Production Checklist](#production-checklist)

## Prerequisites

### Required Services
- PostgreSQL 14+ database
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Server with:
  - 4GB+ RAM
  - 2+ CPU cores
  - 20GB+ storage

### Recommended Platforms
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: AWS EC2, DigitalOcean, Heroku, Railway
- **ML Service**: AWS EC2, Google Cloud Run, Railway
- **Database**: AWS RDS, DigitalOcean Managed PostgreSQL, Supabase

## Environment Setup

### 1. Production Environment Variables

#### Frontend (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ML_URL=https://ml.yourdomain.com
```

#### Backend (`application-prod.yml`)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate  # Use 'validate' in production
    show-sql: false

jwt:
  secret: ${JWT_SECRET}  # Use strong secret (64+ characters)
  expiration: 86400000

ml:
  service:
    url: ${ML_SERVICE_URL}

server:
  port: 8080
  compression:
    enabled: true
```

#### ML Service (`.env.production`)
```env
GEMINI_API_KEY=${GEMINI_API_KEY}
DATABASE_URL=${DATABASE_URL}
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Database Setup

### 1. Create Production Database

```sql
-- Create database
CREATE DATABASE career_intelligence_prod;

-- Create user with strong password
CREATE USER cip_prod_user WITH PASSWORD 'your_strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE career_intelligence_prod TO cip_prod_user;

-- Connect to database
\c career_intelligence_prod

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 2. Run Migrations

```bash
cd cip-backend-lite
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://your-db-host:5432/career_intelligence_prod
```

### 3. Backup Strategy

```bash
# Daily backup script
pg_dump -h your-db-host -U cip_prod_user career_intelligence_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h your-db-host -U cip_prod_user career_intelligence_prod < backup_20260506.sql
```

## Backend Deployment

### Option 1: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# cip-backend-lite/Dockerfile
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t cip-backend:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://db-host:5432/career_intelligence_prod \
  -e DB_USERNAME=cip_prod_user \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -e ML_SERVICE_URL=https://ml.yourdomain.com \
  --name cip-backend \
  cip-backend:latest
```

### Option 2: Traditional Deployment

```bash
# Build JAR
cd cip-backend-lite
mvn clean package -DskipTests

# Run with production profile
java -jar -Dspring.profiles.active=prod target/cip-backend-lite-1.0.0.jar
```

### Option 3: Railway/Heroku

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd cip-backend-lite
railway up
```

## ML Service Deployment

### Option 1: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# cip-ml/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t cip-ml:latest .

# Run container
docker run -d \
  -p 8000:8000 \
  -e GEMINI_API_KEY=your_api_key \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  --name cip-ml \
  cip-ml:latest
```

### Option 2: Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/your-project/cip-ml

# Deploy to Cloud Run
gcloud run deploy cip-ml \
  --image gcr.io/your-project/cip-ml \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd cip-web
vercel --prod
```

#### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.yourdomain.com",
    "NEXT_PUBLIC_ML_URL": "https://ml.yourdomain.com"
  }
}
```

### Option 2: Docker + Nginx

#### 1. Build Production

```bash
cd cip-web
npm run build
```

#### 2. Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production

EXPOSE 3000
CMD ["npm", "start"]
```

#### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Static Export + CDN

```bash
# Build static export
cd cip-web
npm run build
npm run export

# Deploy to S3/CloudFront or Netlify
aws s3 sync out/ s3://your-bucket-name
```

## Production Checklist

### Security

- [ ] Use HTTPS for all services
- [ ] Set strong JWT secret (64+ characters)
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Use secure database passwords
- [ ] Enable database SSL connections
- [ ] Set up API key rotation

### Performance

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Enable caching (Redis recommended)
- [ ] Optimize images and assets
- [ ] Enable HTTP/2
- [ ] Set up load balancing (if needed)

### Monitoring

- [ ] Set up application logging
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure database monitoring
- [ ] Set up alerts for errors
- [ ] Monitor API response times
- [ ] Track user analytics

### Backup & Recovery

- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up file storage backups
- [ ] Configure backup retention policy

### Testing

- [ ] Run all tests before deployment
- [ ] Test in staging environment
- [ ] Verify all API endpoints
- [ ] Test authentication flow
- [ ] Verify file uploads work
- [ ] Test interview system
- [ ] Check certificate validation
- [ ] Verify email notifications

## Docker Compose (All Services)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: career_intelligence_prod
      POSTGRES_USER: cip_prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./cip-backend-lite
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/career_intelligence_prod
      DB_USERNAME: cip_prod_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ML_SERVICE_URL: http://ml-service:8000
    depends_on:
      - postgres

  ml-service:
    build: ./cip-ml
    ports:
      - "8000:8000"
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      DATABASE_URL: postgresql://cip_prod_user:${DB_PASSWORD}@postgres:5432/career_intelligence_prod

  frontend:
    build: ./cip-web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080
      NEXT_PUBLIC_ML_URL: http://ml-service:8000

volumes:
  postgres_data:
```

## Troubleshooting

### Backend Issues

```bash
# Check logs
docker logs cip-backend

# Check database connection
psql -h your-db-host -U cip_prod_user -d career_intelligence_prod

# Restart service
docker restart cip-backend
```

### ML Service Issues

```bash
# Check logs
docker logs cip-ml

# Test endpoint
curl http://your-ml-service/health

# Restart service
docker restart cip-ml
```

### Frontend Issues

```bash
# Check build logs
vercel logs

# Test locally
npm run build && npm start

# Clear cache
rm -rf .next && npm run build
```

## Support

For deployment issues, contact: abhaysahucse@gmail.com

---

**🎉 Congratulations on deploying your Career Intelligence Platform!**
