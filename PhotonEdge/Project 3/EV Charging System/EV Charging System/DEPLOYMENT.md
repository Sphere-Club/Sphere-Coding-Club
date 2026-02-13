# Deployment Guide

Complete guide for deploying the Smart EV Auto-Reservation Platform to production.

---

## Prerequisites

- Server with Node.js ≥16.0.0
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Process manager (PM2 recommended)

---

## Option 1: Traditional VPS Deployment

### Step 1: Server Setup

#### 1.1 Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 1.2 Install PM2
```bash
npm install -g pm2
```

#### 1.3 Install Nginx (for reverse proxy)
```bash
sudo apt update
sudo apt install nginx
```

### Step 2: Clone and Setup

```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> ev-charging
cd ev-charging/z

# Install server dependencies
cd server
npm install --production

# Install client dependencies and build
cd ../client
npm install
npm run build
```

### Step 3: Environment Configuration

Create production environment files:

**Server: `/var/www/ev-charging/z/server/.env`**
```env
NODE_ENV=production
PORT=3000
DB_PATH=/var/www/ev-charging/z/server/database.sqlite
QR_SECRET=your-very-secure-secret-key-here
RESERVATION_EXPIRY_MINUTES=15
CLEANUP_INTERVAL_MS=60000
```

**Client: `/var/www/ev-charging/z/client/.env`**
```env
VITE_API_URL=https://yourdomain.com
VITE_SOCKET_URL=https://yourdomain.com
VITE_EV_START_LAT=18.5204
VITE_EV_START_LNG=73.8567
```

### Step 4: Start Backend with PM2

```bash
cd /var/www/ev-charging/z/server
pm2 start index.js --name ev-server
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

**PM2 Commands:**
```bash
pm2 status          # View status
pm2 logs ev-server  # View logs
pm2 restart ev-server  # Restart
pm2 stop ev-server  # Stop
pm2 delete ev-server  # Remove
```

### Step 5: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/ev-charging
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (React build)
    location / {
        root /var/www/ev-charging/z/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ev-charging /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### Step 7: Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Option 2: Docker Deployment

### Step 1: Create Dockerfiles

**Server Dockerfile (`server/Dockerfile`):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "index.js"]
```

**Client Dockerfile (`client/Dockerfile`):**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Client Nginx config (`client/nginx.conf`):**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 2: Docker Compose

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  server:
    build: ./server
    container_name: ev-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./server/data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_PATH=/app/data/database.sqlite
      - QR_SECRET=${QR_SECRET}
      - RESERVATION_EXPIRY_MINUTES=15
      - CLEANUP_INTERVAL_MS=60000
    networks:
      - ev-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  client:
    build: ./client
    container_name: ev-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - ev-network

networks:
  ev-network:
    driver: bridge
```

**`.env` file:**
```env
QR_SECRET=your-very-secure-secret-key
```

### Step 3: Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## Option 3: Cloud Platform Deployment

### 3.1 Vercel (Frontend) + Render (Backend)

#### Frontend (Vercel)
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Set build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `client`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
6. Deploy

#### Backend (Render)
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Root Directory**: `server`
5. Add environment variables
6. Deploy

### 3.2 AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Configure security groups (ports 22, 80, 443)
3. SSH into instance
4. Follow VPS deployment steps above
5. Use Elastic IP for static address
6. Configure Route 53 for domain

### 3.3 Heroku

**Backend:**
```bash
cd server
heroku create ev-charging-backend
heroku config:set NODE_ENV=production
heroku config:set QR_SECRET=your-secret
git push heroku main
```

**Procfile:**
```
web: node index.js
```

---

## Production Checklist

### Security
- [ ] Set strong QR_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Add authentication (if needed)
- [ ] Sanitize all inputs
- [ ] Keep dependencies updated

### Performance
- [ ] Enable Gzip compression
- [ ] Add CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Enable HTTP/2

### Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable PM2 monitoring
- [ ] Set up database backups
- [ ] Monitor server resources

### Configuration
- [ ] Set production environment variables
- [ ] Configure CORS origins
- [ ] Set proper log levels
- [ ] Configure Socket.IO for production
- [ ] Update API URLs

---

## Backup Strategy

### Database Backup

**Automated backup script (`backup.sh`):**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ev-charging"
DB_PATH="/var/www/ev-charging/z/server/database.sqlite"

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/database_$DATE.sqlite"

# Keep only last 7 days
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete

echo "Backup completed: database_$DATE.sqlite"
```

**Setup cron job:**
```bash
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /var/www/ev-charging/backup.sh
```

---

## Rollback Procedure

If deployment fails:

```bash
# Rollback server
cd /var/www/ev-charging/z
git log  # Find previous commit
git checkout <previous-commit-hash>
cd server
npm install
pm2 restart ev-server

# Rollback client
cd ../client
npm install
npm run build
sudo systemctl restart nginx
```

---

## Scaling Considerations

For high traffic:

1. **Load Balancer:** Use Nginx or HAProxy
2. **Database:** Migrate to PostgreSQL/MySQL
3. **Caching:** Add Redis for sessions
4. **CDN:** CloudFlare or AWS CloudFront
5. **Horizontal Scaling:** Multiple server instances
6. **Microservices:** Split API into separate services

---

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Logging
Use Winston or Pino for structured logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Post-Deployment Testing

1. **Health Check:** `curl https://yourdomain.com/health`
2. **API Test:** Test all endpoints
3. **Socket.IO:** Verify real-time updates
4. **QR Verification:** Test complete flow
5. **Emergency Flow:** Test <10% battery scenario
6. **Load Test:** Use Apache Bench or k6

---

## Support & Maintenance

- Schedule regular security updates
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Test backups quarterly
