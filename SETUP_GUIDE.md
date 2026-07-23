# 🚀 PostgreSQL + Docker Setup Guide

## 📋 Prerequisites

- Node.js 20+ installed
- Docker Desktop installed and running
- Git (for version control)

## 🎯 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Install Prisma and PostgreSQL driver
npm install prisma @prisma/client pg bcrypt
npm install -D @types/pg @types/bcrypt tsx

# Or use this command:
npm install prisma @prisma/client pg bcrypt && npm install -D @types/pg @types/bcrypt tsx
```

### Step 2: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (or use defaults)
```

### Step 3: Start Docker Containers

```bash
# Start PostgreSQL + PgAdmin
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Expected output:
```
NAME              STATUS              PORTS
grc-postgres      Up 30 seconds       0.0.0.0:5432->5432/tcp
grc-pgadmin       Up 30 seconds       0.0.0.0:5050->80/tcp
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with demo data
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3001

---

## 🔐 Default Credentials

### Application Users
- **Admin**: admin@grc.com / password
- **Risk Owner**: owner@grc.com / password
- **Auditor**: auditor@grc.com / password
- **CRO**: cro@grc.com / password

### PgAdmin (Database UI)
- URL: http://localhost:5050
- Email: admin@grc.local
- Password: admin

---

## 📊 Database Management

### Access PgAdmin

1. Open http://localhost:5050
2. Login with credentials above
3. Add server:
   - Name: GRC Wisdom
   - Host: postgres (container name)
   - Port: 5432
   - Database: grc_wisdom
   - Username: grc_user
   - Password: grc_password_dev

### Prisma Studio (Visual Editor)

```bash
npx prisma studio
```

Opens at: http://localhost:5555

---

## 🛠️ Common Commands

### Database Operations

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Pull schema from existing database
npx prisma db pull
```

### Docker Operations

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart postgres

# Remove all data (⚠️ deletes volumes)
docker-compose down -v
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://grc_user:grc_password_dev@localhost:5432/grc_wisdom

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production

# PostgreSQL
POSTGRES_USER=grc_user
POSTGRES_PASSWORD=grc_password_dev
POSTGRES_DB=grc_wisdom
```

### Production Settings

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-prod-db:5432/grc_wisdom
JWT_SECRET=use-a-strong-random-secret-here
```

---

## 🐛 Troubleshooting

### Issue: Port 5432 already in use

```bash
# Check what's using port 5432
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Kill the process or change port in docker-compose.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Issue: Docker containers won't start

```bash
# View logs
docker-compose logs postgres

# Remove old containers and volumes
docker-compose down -v
docker-compose up -d
```

### Issue: Prisma migration fails

```bash
# Reset and start fresh
npx prisma migrate reset
npx prisma migrate dev
```

### Issue: Cannot connect to database

1. Check Docker is running: `docker ps`
2. Check connection string in .env
3. Verify PostgreSQL is healthy: `docker-compose logs postgres`
4. Try connecting manually:
   ```bash
   psql postgresql://grc_user:grc_password_dev@localhost:5432/grc_wisdom
   ```

---

## 📦 Production Deployment

### Option 1: Docker (Recommended)

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Option 2: Cloud Services

**Database**: Use managed PostgreSQL
- AWS RDS
- Azure Database for PostgreSQL
- Google Cloud SQL
- Supabase
- Railway
- Render

**Application**: Deploy Node.js app
- AWS ECS/EKS
- Azure Container Instances
- Google Cloud Run
- Heroku
- Vercel (frontend) + Railway (backend)

---

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable SSL for database connections
- [ ] Restrict database ports (not exposed publicly)
- [ ] Use environment variables (never commit .env)
- [ ] Enable database backups
- [ ] Use read replicas for reporting
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates

---

## 📈 Performance Optimization

### Connection Pooling

Prisma automatically handles connection pooling. Configure in schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings
  connectionLimit = 10
}
```

### Indexes

Already included in schema for:
- User lookups (email, id)
- Risk queries (code, owner, status)
- Control searches (code, type)
- Audit logs (userId, entity, timestamp)

### Caching (Future)

Add Redis for:
- Session management
- API response caching
- Real-time notifications

---

## 📚 Next Steps

1. ✅ Database running
2. ✅ Migrations applied
3. ✅ Seed data loaded
4. [ ] **Update server.ts** to use Prisma (see DATABASE_MIGRATION_PLAN.md)
5. [ ] Test all API endpoints
6. [ ] Add data validation
7. [ ] Implement backup strategy
8. [ ] Setup monitoring
9. [ ] Deploy to production

---

## 🆘 Need Help?

- Documentation: https://www.prisma.io/docs
- Docker: https://docs.docker.com
- PostgreSQL: https://www.postgresql.org/docs

---

**Status**: ✅ Infrastructure Ready - Database migrated from in-memory to PostgreSQL!
