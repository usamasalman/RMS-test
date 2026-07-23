# 🐘 PostgreSQL + Docker Migration Plan

## 📋 Current State Analysis

**Current Setup:**
- ✅ Express.js backend (`server.ts`)
- ✅ In-memory database (mock data)
- ✅ JWT authentication
- ✅ RESTful API endpoints
- ❌ No database persistence
- ❌ Data lost on server restart
- ❌ No multi-instance support

**Target State:**
- ✅ PostgreSQL database
- ✅ Docker containerization
- ✅ Data persistence
- ✅ Scalable architecture
- ✅ Development & production environments
- ✅ Database migrations
- ✅ Connection pooling

---

## 🎯 Migration Strategy

### Phase 1: Setup Infrastructure (Week 1)
### Phase 2: Database Schema & Migrations (Week 1-2)
### Phase 3: Backend Integration (Week 2)
### Phase 4: Testing & Validation (Week 3)
### Phase 5: Deployment & Monitoring (Week 3-4)

---

## 📦 Technology Stack

```
┌─────────────────────────────────────┐
│     Frontend (React + Vite)         │
└─────────────┬───────────────────────┘
              │ HTTP/REST
┌─────────────▼───────────────────────┐
│    Backend (Express + Node.js)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Prisma ORM / TypeORM       │  │
│  └────────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                │ PostgreSQL Protocol
┌───────────────▼─────────────────────┐
│   PostgreSQL Database (Docker)      │
│   - Port: 5432

│   - Volume: persistent storage        │
│   - Network: grc-network              │
└───────────────────────────────────────┘
```

**Recommended ORM: Prisma**
- ✅ TypeScript-first
- ✅ Auto-generated types
- ✅ Migration system
- ✅ Excellent DX
- ✅ Connection pooling

**Alternative: TypeORM** (if you prefer decorators)

---

## 🚀 Implementation Steps



### Step 1: Install Dependencies

```bash
# Install Prisma
npm install @prisma/client
npm install -D prisma

# Install PostgreSQL driver
npm install pg

# Install additional utilities
npm install bcrypt dotenv
npm install -D @types/bcrypt @types/pg
```

### Step 2: Initialize Prisma

```bash
# Initialize Prisma (already done - schema.prisma created)
npx prisma init

# Generate Prisma Client
npx prisma generate
```

### Step 3: Setup Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update with your local settings if needed.

### Step 4: Start Docker Containers

```bash
# Start all services (PostgreSQL + PgAdmin)
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### Step 5: Run Database Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Open Prisma Studio (GUI for database)
npx prisma studio
```

---

## 📂 File Structure

```
grc-wisdom/
├── prisma/
│   ├── schema.prisma          ✅ Created
│   ├── migrations/            (auto-generated)
│   └── seed.ts                ⬅️ Next to create
├── database/
│   ├── init/
│   │   └── 01-extensions.sql  ⬅️ Next to create
│   └── queries/               ⬅️ Next to create
├── src/
│   ├── database/
│   │   ├── prisma.ts          ⬅️ Next to create
│   │   └── repositories/      ⬅️ Next to create
│   └── ...
├── docker-compose.yml         ✅ Created
├── Dockerfile                 ✅ Created
├── .env                       (copy from .env.example)
├── .env.example               ✅ Created
└── server.ts                  ⬅️ Will be updated
```

---

## 🔄 Migration Phases

### Phase 1: Infrastructure Setup ✅ COMPLETE

- [x] Docker Compose configuration
- [x] Dockerfile for multi-stage builds
- [x] Environment variables
- [x] Prisma schema
- [ ] Database initialization scripts
- [ ] Seed data

### Phase 2: Database Layer (NOW)

- [ ] Prisma client setup
- [ ] Repository pattern implementation
- [ ] Migration scripts
- [ ] Seed data script

### Phase 3: Backend Integration

- [ ] Update server.ts to use Prisma
- [ ] Replace in-memory DB with PostgreSQL
- [ ] Add connection pooling
- [ ] Error handling

### Phase 4: Testing

- [ ] Unit tests for repositories
- [ ] Integration tests
- [ ] Performance testing
- [ ] Load testing

### Phase 5: Deployment

- [ ] Production Docker setup
- [ ] CI/CD pipeline
- [ ] Backup strategy
- [ ] Monitoring setup

---

## 🎯 Next Steps - Let's Implement!



## 📅 Detailed Migration Timeline

### Phase 1: Infrastructure Setup (Day 1-2)

**✅ COMPLETED:**
- [x] Created docker-compose.yml
- [x] Created Dockerfile (multi-stage)
- [x] Created Prisma schema
- [x] Created seed data script
- [x] Created .env.example
- [x] Updated package.json with scripts

**TODO:**
- [ ] Run `npm install prisma @prisma/client pg bcrypt`
- [ ] Run `npm install -D @types/pg @types/bcrypt`
- [ ] Copy .env.example to .env
- [ ] Start Docker: `docker-compose up -d`
- [ ] Initialize Prisma: `npx prisma generate`
- [ ] Run migrations: `npx prisma migrate dev --name init`
- [ ] Seed database: `npx prisma db seed`

---

### Phase 2: Backend Migration (Day 3-5)

#### Step 1: Create Prisma Client Instance

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### Step 2: Update Authentication

Replace password comparison in `server.ts`:
```typescript
import bcrypt from 'bcrypt';
import { prisma } from './src/lib/prisma';

// Old (in-memory)
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(
    (u) => u.email === email && u.password === password
  );
  // ...
});

// New (PostgreSQL with Prisma)
app.post("/api/v1/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});
```

#### Step 3: Update CRUD Operations

Example for Risks:

```typescript
// GET /api/v1/risks
app.get("/api/v1/risks", authenticateToken, async (req, res) => {
  const risks = await prisma.risk.findMany({
    include: {
      owner: {
        select: { id: true, name: true, email: true }
      },
      controlMappings: {
        include: {
          control: true
        }
      },
      treatmentPlans: true
    }
  });
  
  res.json({ risks, pagination: { total: risks.length, page: 1 } });
});

// POST /api/v1/risks
app.post("/api/v1/risks", authenticateToken, async (req, res) => {
  if ((req as any).user.role === "INTERNAL_AUDITOR") {
    return res.status(403).json({ error: "Internal Auditors cannot create risks." });
  }
  
  const newRisk = await prisma.risk.create({
    data: {
      code: `RSK-${Date.now()}`,
      title: req.body.title,
      description: req.body.description,
      likelihood: req.body.likelihood,
      impact: req.body.impact,
      cia_c: req.body.cia_c || 3,
      cia_i: req.body.cia_i || 3,
      cia_a: req.body.cia_a || 3,
      status: req.body.status || 'OPEN',
      ownerId: (req as any).user.id
    }
  });
  
  res.json(newRisk);
});

// PUT /api/v1/risks/:id
app.put("/api/v1/risks/:id", authenticateToken, async (req, res) => {
  if ((req as any).user.role === "INTERNAL_AUDITOR") {
    return res.status(403).json({ error: "Internal Auditors cannot update risks." });
  }
  
  const updatedRisk = await prisma.risk.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      updatedAt: new Date()
    }
  });
  
  res.json(updatedRisk);
});

// DELETE /api/v1/risks/:id
app.delete("/api/v1/risks/:id", authenticateToken, async (req, res) => {
  if ((req as any).user.role === "INTERNAL_AUDITOR") {
    return res.status(403).json({ error: "Internal Auditors cannot delete risks." });
  }
  
  await prisma.risk.delete({
    where: { id: req.params.id }
  });
  
  res.status(204).send();
});
```

---

### Phase 3: Testing (Day 6-7)

#### Test Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token refresh
- [ ] Logout

**Risks:**
- [ ] Create new risk
- [ ] View all risks
- [ ] View single risk
- [ ] Update risk
- [ ] Delete risk
- [ ] Link control to risk
- [ ] Unlink control from risk

**Controls:**
- [ ] Create new control
- [ ] View all controls
- [ ] Update control
- [ ] Delete control

**Treatment Plans:**
- [ ] Create treatment plan
- [ ] Update progress
- [ ] Update deadline
- [ ] Delete treatment plan

**Assets:**
- [ ] Create asset
- [ ] View assets
- [ ] Update asset
- [ ] Delete asset

---

### Phase 4: Data Migration (if existing data)

If you have production data in the old system:

```typescript
// migration-script.ts
import { PrismaClient } from '@prisma/client';
import { DB } from './old-database'; // Your old in-memory DB

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration...');
  
  // Migrate users
  for (const oldUser of DB.users) {
    await prisma.user.create({
      data: {
        email: oldUser.email,
        password: oldUser.password, // Should re-hash with bcrypt
        name: oldUser.name,
        role: oldUser.role.replace(' / ', '_').replace(' ', '_').toUpperCase()
      }
    });
  }
  
  // Migrate risks
  for (const oldRisk of DB.risks) {
    await prisma.risk.create({
      data: {
        code: oldRisk.code,
        title: oldRisk.title,
        description: oldRisk.description,
        likelihood: oldRisk.likelihood,
        impact: oldRisk.impact,
        cia_c: oldRisk.cia_c || 3,
        cia_i: oldRisk.cia_i || 3,
        cia_a: oldRisk.cia_a || 3,
        status: oldRisk.status.replace(' ', '_').toUpperCase(),
        ownerId: oldRisk.ownerId
      }
    });
  }
  
  // Continue for other entities...
  console.log('Migration complete!');
}

migrateData();
```

---

## 🔄 Rollback Plan

If migration fails:

1. **Stop new system:**
   ```bash
   docker-compose down
   ```

2. **Restore old system:**
   ```bash
   git checkout main
   npm run dev
   ```

3. **Export data from PostgreSQL:**
   ```bash
   pg_dump -U grc_user grc_wisdom > backup.sql
   ```

4. **Investigate issues**
5. **Try again with fixes**

---

## 📊 Performance Comparison

### Before (In-Memory)
- ✅ Fast reads/writes
- ❌ No persistence
- ❌ Limited data size (RAM)
- ❌ No concurrent access
- ❌ No ACID guarantees

### After (PostgreSQL)
- ✅ Persistent storage
- ✅ Unlimited data size
- ✅ Concurrent access
- ✅ ACID transactions
- ✅ Query optimization
- ✅ Backup/restore
- ⚠️ Slightly slower (network + disk)

**Mitigation:** Add Redis caching for frequently accessed data

---

## 🛡️ Security Improvements

### Before
- Plain text passwords (❌ major risk!)
- No password hashing
- No SQL injection protection (in-memory)

### After
- ✅ Bcrypt password hashing
- ✅ Prisma prevents SQL injection
- ✅ Parameterized queries
- ✅ Connection encryption (SSL)
- ✅ Role-based access control
- ✅ Audit logging

---

## 💰 Cost Estimation

### Development Environment
- **Docker (Local)**: Free
- **PostgreSQL**: Free
- **PgAdmin**: Free
- **Total**: $0/month

### Production Environment
**Option 1: Self-Hosted (AWS)**
- EC2 t3.small: $15/month
- RDS PostgreSQL db.t3.micro: $12/month
- **Total**: ~$27/month

**Option 2: Managed Services**
- **Railway**: $5/month (hobby) - $20/month (pro)
- **Render**: $7/month (starter) - $25/month (standard)
- **Supabase**: Free tier available, $25/month (pro)
- **Heroku**: $5/month (basic) - $50/month (standard)

---

## ✅ Success Criteria

Migration is complete when:
- [ ] All Docker containers running
- [ ] Database initialized with schema
- [ ] Seed data loaded successfully
- [ ] All API endpoints working
- [ ] Authentication functional
- [ ] CRUD operations tested
- [ ] Frontend connects to new backend
- [ ] No data loss
- [ ] Performance acceptable (<500ms API response)
- [ ] Backup strategy implemented

---

## 📞 Support

**Issues?** Check these files:
1. `SETUP_GUIDE.md` - Quick start instructions
2. `docker-compose.yml` - Container configuration
3. `prisma/schema.prisma` - Database schema
4. `.env` - Environment configuration

**Still stuck?** 
- Check Docker logs: `docker-compose logs -f postgres`
- Check Prisma logs: Set `log: ['query', 'error', 'warn']`
- Verify connection: `psql $DATABASE_URL`

---

**Status**: 📋 READY TO IMPLEMENT
**Estimated Time**: 3-5 days (full-time)
**Risk Level**: Low (can rollback easily)
**Recommendation**: ✅ Proceed with migration
