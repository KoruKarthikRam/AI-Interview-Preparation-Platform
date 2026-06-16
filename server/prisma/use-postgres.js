const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider = "sqlite" with provider = "postgresql"
content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Prisma schema datasource provider switched to PostgreSQL.');
