# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Dev dependencies
FROM deps AS dev-deps
RUN npm install --save-dev nodemon

# Stage 3: Development
FROM node:18-alpine AS dev

WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
COPY ./.env.example ./.env

ENV PORT=3000
EXPOSE 3000
CMD ["npx", "nodemon", "-L", "."]

# Stage 4: Production
FROM node:18-alpine AS prod

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./.env.example ./.env

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
