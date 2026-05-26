FROM node:20-alpine AS deps
WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

FROM deps AS dev
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "run", "start"]
