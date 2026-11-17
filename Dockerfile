# Imagem para o Render (plano grátis, tipo "Docker"). O build gera parte do código com o
# OpenAPI Generator, que precisa de Java; por isso a etapa de build tem JDK.
FROM node:22-bookworm-slim AS build
RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-17-jre-headless ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY source/package.json source/package-lock.json ./
RUN npm ci
COPY source/ ./
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
# O Render informa a porta em PORT (o servidor já lê essa variável).
CMD ["node", "dist/server.js"]
