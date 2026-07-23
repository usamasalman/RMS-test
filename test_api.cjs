const http = require('http');

const req = http.request('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login status:', res.statusCode);
    const body = JSON.parse(data);
    if (!body.token) {
      console.log('Login failed:', body);
      return;
    }
    
    // Test audit log
    http.get('http://localhost:3001/api/v1/audit-log', {
      headers: {
        'Authorization': `Bearer ${body.token}`
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Audit Log status:', res2.statusCode);
        console.log('Audit Log body:', data2.slice(0, 200));
      });
    });
  });
});

req.write(JSON.stringify({ email: 'admin@grc.com', password: 'password' }));
req.end();
