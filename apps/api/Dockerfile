FROM oven/bun:1.3.13 AS build
WORKDIR /app

COPY bun.lock package.json turbo.json ./
COPY apps apps
COPY packages packages
COPY turbo turbo
RUN bun install --frozen-lockfile --ignore-scripts

ENV VITE_API_URL=https://briefdock086.colmena.dev
ENV VITE_NAME=BriefDock
RUN bun run build

FROM oven/bun:1.3.13-slim
WORKDIR /app
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages ./packages

ENV CORS_ORIGINS=https://briefdock086.colmena.dev
ENV DATABASE_PATH=/data/briefdock.sqlite
ENV GITHUB_REPOS=obrera/nightshift-085-relicforge,obrera/nightshift-agents,create-seed/templates
ENV NODE_ENV=production
ENV OPERATOR_PASSCODE=nightshift-086
ENV PORT=3000
EXPOSE 3000
VOLUME ["/data"]

CMD ["bun", "apps/api/src/index.ts"]
