FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./

COPY packages/shared/package.json ./packages/shared/
COPY packages/shared ./packages/shared

COPY apps/pwa/package.json ./apps/pwa/

RUN npm ci --workspace=apps/pwa --include-workspace-root

COPY apps/pwa ./apps/pwa

ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build --workspace=apps/pwa

FROM nginx:stable-alpine AS runner

COPY --from=builder /app/apps/pwa/dist /usr/share/nginx/html
COPY apps/pwa/deploy/prod/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
