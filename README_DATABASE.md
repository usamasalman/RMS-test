# 🗄️ Database Setup - README

## 🎯 What This Is

Complete PostgreSQL + Docker implementation for GRC Wisdom Platform.

**Current Status**: In-memory database → PostgreSQL migration ready

---

## ⚡ Quick Start

```bash
# Copy this command and run:
npm install prisma @prisma/client pg bcrypt && npm install -D @types/pg @types/bcrypt tsx && cp .env.example .env && docker-compose up -d && npm run db:setup && npm run dev
```

**That's it!** ✨

Access:
- App: http://localhost:3001
- PgAdmin: http://localhost:5050
- Login: admin@grc.com / password

---

## 📁 Files Created

### Infrastructure
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Application containerization
- `.env.example` - Configuration template

### Database
- `prisma/schema.prisma` - Database schema (11 tables)
- `prisma/seed.ts` - Demo data
- `database/init/01-extensions.sql` - PostgreSQL setup

### Documentation
- `QUICK_START.md` - 5-minute setup
- `SETUP_GUIDE.md` - Complete guide
- `DATABASE_MIGRATION_PLAN.md` - Migration strategy
- `POSTGRES_DOCKER_SUMMARY.md` - Full summary
- `README_DATABASE.md` - This file

---

## 🏗️ Architecture

```
React Frontend
      ↓
Express Backend (server.ts)
      ↓
Prisma ORM
      ↓
PostgreSQL (Docker)
```

---

## 📊 Database Tables

1. **users** - Authentication & roles
2. **risks** - Risk assessments
3. **controls** - Control library
4. **risk_control_mappings** - Risk↔Control links
5. **treatment_plans** - Mitigation actions
6. **assets** - Asset inventory
7. **kris** - Key risk indicators
8. **audit_logs** - Activity tracking
9. **notifications** - User alerts
10. **report_audits** - Report generation logs

---

## 🔧 Available Commands

```bash
# Start everything
docker-compose up -d && npm run dev

# View database
npx prisma studio

# Reset database
npm run prisma:reset

# Stop everything
docker-compose down
```

---

## 📚 Documentation Guide

**New to this?** Start here:
1. **QUICK_START.md** ← Start here! (5 minutes)
2. **SETUP_GUIDE.md** ← Detailed walkthrough
3. **DATABASE_MIGRATION_PLAN.md** ← Migration details
4. **POSTGRES_DOCKER_SUMMARY.md** ← Complete overview

**Already running?**
- Troubleshooting → SETUP_GUIDE.md
- Commands → POSTGRES_DOCKER_SUMMARY.md
- Migration code → DATABASE_MIGRATION_PLAN.md

---

## ✅ What's Done

- ✅ Docker configuration
- ✅ Database schema
- ✅ Seed data
- ✅ Complete documentation
- ✅ Ready to implement

## 🚧 What's Next

- [ ] Update `server.ts` to use Prisma
- [ ] Test all API endpoints
- [ ] Deploy to production

**Estimated Time**: 2-3 days

---

## 🆘 Need Help?

**Quick fixes:**
```bash
# Port 5432 in use? Change in docker-compose.yml
# Prisma error? Run: npx prisma generate
# Docker won't start? Run: docker-compose down -v && docker-compose up -d
```

**Still stuck?** Check SETUP_GUIDE.md troubleshooting section

---

## 🎓 Key Concepts

**Prisma**: Type-safe database toolkit (replaces raw SQL)
**Docker**: Containers for PostgreSQL (no local install needed)
**Migrations**: Version-controlled database changes
**Seeding**: Pre-load demo data for testing

---

## 💡 Why This Setup?

**Before:**
- ❌ Data lost on restart
- ❌ Can't scale
- ❌ No backups
- ❌ Plain text passwords

**After:**
- ✅ Persistent storage
- ✅ Scalable
- ✅ Backup-ready
- ✅ Bcrypt hashing
- ✅ Production-ready

---

## 🚀 Ready to Start?

```bash
npm install prisma @prisma/client pg bcrypt
npm install -D @types/pg @types/bcrypt tsx
cp .env.example .env
docker-compose up -d
npm run db:setup
npm run dev
```

**Good luck!** 🎉

---

**Questions?** See the documentation files listed above.
**Issues?** Check SETUP_GUIDE.md troubleshooting.
**Contributing?** Follow the migration plan in DATABASE_MIGRATION_PLAN.md
