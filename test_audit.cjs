const jwt = require("jsonwebtoken");

async function test() {
  try {
    const login = await fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@grc.com", password: "password" })
    });
    const { token } = await login.json();
    console.log("Token:", token.substring(0, 20) + "...");

    // Create a new risk
    const createRes = await fetch("http://localhost:3001/api/v1/risks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        code: "RSK-999",
        title: "Test Risk",
        description: "Test",
        likelihood: 3,
        impact: 3,
        ownerId: "u1"
      })
    });
    console.log("Create status:", createRes.status);
    console.log("Create body:", await createRes.text());

    // Fetch audit log
    const auditRes = await fetch("http://localhost:3001/api/v1/audit-log", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Audit status:", auditRes.status);
    console.log("Audit body:", await auditRes.text());
  } catch (err) {
    console.error(err);
  }
}
test();
