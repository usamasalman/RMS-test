const jwt = require("jsonwebtoken");

async function testUpdate() {
  try {
    const login = await fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@grc.com", password: "password" })
    });
    const { token } = await login.json();

    // fetch risks
    const risksRes = await fetch("http://localhost:3001/api/v1/risks", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const { risks } = await risksRes.json();
    const firstRisk = risks[0];

    console.log("Updating risk:", firstRisk.id);
    const updateRes = await fetch(`http://localhost:3001/api/v1/risks/${firstRisk.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...firstRisk,
        title: firstRisk.title + " (Updated)",
        likelihood: 5
      })
    });
    console.log("Update status:", updateRes.status);
    
    // Fetch audit log
    const auditRes = await fetch("http://localhost:3001/api/v1/audit-log", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const auditData = await auditRes.json();
    const latestAudit = auditData.auditLog[0];
    console.log("Latest Audit Action:", latestAudit.action);
    console.log("Latest Audit Entity:", latestAudit.entityType);
    console.log("Field changes:", JSON.stringify(latestAudit.fieldChanges));

  } catch (err) {
    console.error(err);
  }
}
testUpdate();
