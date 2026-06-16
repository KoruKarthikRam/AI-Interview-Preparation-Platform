const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider = "postgresql" with provider = "sqlite"
content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Prisma schema datasource provider switched to SQLite.');
