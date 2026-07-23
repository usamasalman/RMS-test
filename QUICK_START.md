# ⚡ Quick Start - PostgreSQL + Docker

## 🎯 Complete Setup in 5 Commands

```bash
# 1. Install dependencies
npm install prisma @prisma/client pg bcrypt && npm install -D @types/pg @types/bcrypt tsx

# 2. Setup environment
cp .env.example .env

# 3. Start Docker containers
docker-compose up -d

# 4. Initialize database
npm run db:setup

# 5. Start development server
npm run dev
```

**Done!** Visit http://localhost:3001

---

## 📝 What Each Command Does

### 1. Install Dependencies
Installs:
- `prisma` - Database toolkit
- `@prisma/client` - Type-safe database client
- `pg` - PostgreSQL driver
- `bcrypt` - Password hashing
- Dev dependencies for TypeScript support

### 2. Setup Environment
Creates `.env` file with:
- Database connection string
- JWT secret
- Port configurations
- PgAdmin credentials

### 3. Start Docker
Launches:
- PostgreSQL (port 5432)
- PgAdmin (port 5050)
- Creates persistent volumes for data

### 4. Initialize Database
Runs:
- `prisma generate` - Creates Prisma Client
- `prisma migrate dev` - Creates database tables
- `prisma db seed` - Loads demo data

### 5. Start Server
Starts:
- Express backend (port 3001)
- Vite dev server (HMR on port 3002)
- Connects to PostgreSQL

---

## 🔐 Login Credentials

**Admin**: admin@grc.com / password
**Risk Owner**: owner@grc.com / password
**Auditor**: auditor@grc.com / password

---

## 🎨 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3001 | Main app |
| PgAdmin | http://localhost:5050 | Database UI |
| Prisma Studio | Run `npx prisma studio` | Data editor |

---

## 🛠️ Useful Commands

```bash
# View Docker logs
docker-compose logs -f

# Open Prisma Studio
npx prisma studio

# Reset database
npm run prisma:reset

# Stop everything
docker-compose down
```

---

## ❓ Troubleshooting

**Port 5432 already in use?**
```bash
# Change port in docker-compose.yml
ports:
  - "5433:5432"
```

**Migration failed?**
```bash
npm run prisma:reset
npm run db:setup
```

**Docker not starting?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📚 Next Steps

1. ✅ System running
2. Update `server.ts` to use Prisma (see DATABASE_MIGRATION_PLAN.md)
3. Test all API endpoints
4. Deploy to production

---

**Need detailed help?** See `SETUP_GUIDE.md`
