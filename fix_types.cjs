const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/\(req, res\) => \{/g, '(req: any, res: any) => {');

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Fixed req, res types in server.ts');
