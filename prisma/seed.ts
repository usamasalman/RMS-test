import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Users
  const u1 = await prisma.user.upsert({
    where: { email: "admin@grc.com" },
    update: {},
    create: {
      id: "u1",
      email: "admin@grc.com",
      password: "password",
      role: "Administrator",
      name: "Admin User",
    },
  });

  const u2 = await prisma.user.upsert({
    where: { email: "owner@grc.com" },
    update: {},
    create: {
      id: "u2",
      email: "owner@grc.com",
      password: "password",
      role: "Risk Owner",
      name: "Risk Owner",
    },
  });

  const u3 = await prisma.user.upsert({
    where: { email: "auditor@grc.com" },
    update: {},
    create: {
      id: "u3",
      email: "auditor@grc.com",
      password: "password",
      role: "Internal Auditor",
      name: "Internal Auditor",
    },
  });

  const u4 = await prisma.user.upsert({
    where: { email: "cro@grc.com" },
    update: {},
    create: {
      id: "u4",
      email: "cro@grc.com",
      password: "password",
      role: "CRO / Executive",
      name: "CRO Executive",
    },
  });

  const u5 = await prisma.user.upsert({
    where: { email: "compliance@grc.com" },
    update: {},
    create: {
      id: "u5",
      email: "compliance@grc.com",
      password: "password",
      role: "Compliance Officer",
      name: "Compliance Officer",
    },
  });

  const u6 = await prisma.user.upsert({
    where: { email: "board@grc.com" },
    update: {},
    create: {
      id: "u6",
      email: "board@grc.com",
      password: "password",
      role: "Read-Only / Board Viewer",
      name: "Board Viewer",
    },
  });

  // 2. Create Assets
  const a1 = await prisma.asset.upsert({
    where: { code: "AST-001" },
    update: {},
    create: {
      id: "a1",
      code: "AST-001",
      name: "Customer Portal",
      description: "Main customer facing web application",
      type: "Software",
      criticality: "High",
      status: "Active",
      ownerId: "u1",
    },
  });

  const a2 = await prisma.asset.upsert({
    where: { code: "AST-002" },
    update: {},
    create: {
      id: "a2",
      code: "AST-002",
      name: "Primary Database",
      description: "Core customer database",
      type: "Data",
      criticality: "High",
      status: "Active",
      ownerId: "u1",
    },
  });

  // 3. Create Risks
  const r1 = await prisma.risk.upsert({
    where: { code: "RSK-001" },
    update: {},
    create: {
      id: "1",
      code: "RSK-001",
      title: "Customer Data Access Misconfiguration",
      description: "Inadequate access controls may expose sensitive customer records.",
      likelihood: 4,
      impact: 3,
      cia_c: 4,
      cia_i: 4,
      cia_a: 4,
      status: "Open",
      ownerId: "u1",
      relatedAssetId: "a2",
    },
  });

  const r2 = await prisma.risk.upsert({
    where: { code: "RSK-002" },
    update: {},
    create: {
      id: "2",
      code: "RSK-002",
      title: "Third-Party Service Outage",
      description: "Dependence on a single external provider could impact service availability.",
      likelihood: 5,
      impact: 4,
      cia_c: 5,
      cia_i: 5,
      cia_a: 5,
      status: "Under Review",
      ownerId: "u1",
    },
  });

  // 4. Create Controls
  const c1 = await prisma.control.upsert({
    where: { code: "CTRL-001" },
    update: {},
    create: {
      id: "c1",
      code: "CTRL-001",
      title: "Multi-Factor Authentication (MFA)",
      description: "Enforce MFA for all external access to cloud environments.",
      type: "Preventive",
      nature: "Automated",
      designEffectiveness: 0.9,
      operatingEffectiveness: 0.8,
      ownerId: "u2",
      objective: "Ensure only authorized personnel can access sensitive systems remotely.",
      testingProcedure: "Review AWS IAM logs to confirm MFA is enforced on all active user accounts.",
      frequency: "Monthly",
      evidence: "IAM MFA configuration report",
    },
  });

  const c2 = await prisma.control.upsert({
    where: { code: "CTRL-002" },
    update: {},
    create: {
      id: "c2",
      code: "CTRL-002",
      title: "Vendor SLA Monitoring",
      description: "Daily monitoring of vendor uptime against SLAs.",
      type: "Detective",
      nature: "Automated",
      designEffectiveness: 0.7,
      operatingEffectiveness: 0.6,
      ownerId: "u2",
      objective: "Ensure third-party vendors meet operational requirements.",
      testingProcedure: "Compare vendor uptime reports against SLA thresholds.",
      frequency: "Daily",
      evidence: "Uptime monitoring dashboard screenshot",
    },
  });

  // 5. Create Mappings
  await prisma.riskControlMapping.upsert({
    where: { riskId_controlId: { riskId: "1", controlId: "c1" } },
    update: {},
    create: {
      riskId: "1",
      controlId: "c1",
      weight: 1.0,
    },
  });

  await prisma.riskControlMapping.upsert({
    where: { riskId_controlId: { riskId: "2", controlId: "c2" } },
    update: {},
    create: {
      riskId: "2",
      controlId: "c2",
      weight: 0.8,
    },
  });

  // 6. Create Treatment Plans
  await prisma.treatmentPlan.upsert({
    where: { id: "t1" },
    update: {},
    create: {
      id: "t1",
      title: "Strengthen access controls",
      description: "Implement stricter access controls for customer portals.",
      riskId: "1",
      strategy: "Mitigate",
      ownerId: "u2",
      progress: 40,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.treatmentPlan.upsert({
    where: { id: "t2" },
    update: {},
    create: {
      id: "t2",
      title: "Vendor resilience review",
      description: "Assess alternative providers and escalation paths.",
      riskId: "2",
      strategy: "Mitigate",
      ownerId: "u1",
      progress: 80,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
