FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# On startup: switch provider if needed, generate client, push schema, and start
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm start"]
