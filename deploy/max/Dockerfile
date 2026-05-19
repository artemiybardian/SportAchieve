FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace config so npm can resolve inter-package dependencies.
COPY package.json package-lock.json tsconfig.base.json ./

# Copy workspace packages that apps/max depends on.
COPY packages/shared/package.json ./packages/shared/
COPY packages/platform-max/package.json ./packages/platform-max/
COPY packages/shared ./packages/shared
COPY packages/platform-max ./packages/platform-max

# Copy the MAX app itself.
COPY apps/max/package.json ./apps/max/

# Install all workspace dependencies from the root lockfile.
RUN npm ci --workspace=apps/max --include-workspace-root

COPY apps/max ./apps/max

ARG VITE_API_BASE_URL=""
ARG VITE_MAX_APP_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MAX_APP_BASE_URL=$VITE_MAX_APP_BASE_URL

RUN npm run build --workspace=apps/max

# --- Production stage ---
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/apps/max/dist /usr/share/nginx/html
COPY deploy/max/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
