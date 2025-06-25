# Chronicle Game - Deployment Guide

## Overview
Chronicle is a daily historical timeline puzzle game built with React frontend and Node.js/Express backend, using PostgreSQL for data storage.

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git (for cloning/downloading the code)

## Environment Setup

### 1. Database Setup
You'll need a PostgreSQL database. You can use:
- Local PostgreSQL installation
- Cloud providers like Neon, Supabase, or AWS RDS
- Heroku Postgres, Railway, or similar platforms

### 2. Environment Variables
Create a `.env` file in the root directory with:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

## Deployment Options

### Option 1: Traditional VPS/Server Deployment

1. **Install dependencies:**
```bash
npm install
```

2. **Build the application:**
```bash
npm run build
```

3. **Initialize the database:**
```bash
npm run db:push
```

4. **Start the production server:**
```bash
npm start
```

The app will be available at `http://your-server:5000`

### Option 2: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/chronicle
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=chronicle
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **Deploy with Docker:**
```bash
docker-compose up -d
```

### Option 3: Platform-as-a-Service (PaaS)

#### Heroku
1. Create `Procfile`:
```
web: npm start
```

2. Deploy:
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku run npm run db:push
```

#### Railway
1. Connect your Git repository
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically

#### Vercel (Serverless)
Note: Requires converting to serverless functions - not recommended for this architecture.

## Production Configuration

### 1. Security Headers
Add to your reverse proxy (nginx/Apache) or middleware:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### 2. Process Management
Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "chronicle" -- start
pm2 startup
pm2 save
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migration
The app automatically initializes with 150+ historical events. For custom events:

1. Modify `server/data/events.json`
2. Run `npm run db:push` to update schema
3. Restart the application

## Admin Interface
Access the admin panel at `/admin` to:
- Create custom daily puzzles
- Set puzzle titles, subtitles, and descriptions
- Schedule puzzles for specific dates

## Monitoring & Maintenance

### Health Check Endpoint
The app provides a health check at `/api/health`

### Logs
- Application logs: `pm2 logs chronicle`
- Database logs: Check your PostgreSQL logs

### Backup
Regular database backups:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Performance Optimization

1. **Enable gzip compression** in your reverse proxy
2. **Set up CDN** for static assets if needed
3. **Database indexing** is already optimized
4. **Connection pooling** is handled by the Neon adapter

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check DATABASE_URL format
2. **Port conflicts**: Change PORT environment variable
3. **Build failures**: Ensure Node.js 18+ is installed
4. **Missing dependencies**: Run `npm install` in both root and client directories

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

## Support
The game is self-contained with no external API dependencies. All historical events are stored locally in the database.