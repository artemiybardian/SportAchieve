FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace config so npm can resolve inter-package dependencies.
COPY package.json package-lock.json tsconfig.base.json ./

# Copy workspace packages that apps/vk depends on.
COPY packages/shared/package.json ./packages/shared/
COPY packages/platform-vk/package.json ./packages/platform-vk/
COPY packages/shared ./packages/shared
COPY packages/platform-vk ./packages/platform-vk

# Copy the VK app itself.
COPY apps/vk/package.json ./apps/vk/

# Install all workspace dependencies from the root lockfile.
RUN npm ci --workspace=apps/vk --include-workspace-root

COPY apps/vk ./apps/vk

ARG VITE_API_BASE_URL=""
ARG VITE_VK_APP_ID=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VK_APP_ID=$VITE_VK_APP_ID

RUN npm run build --workspace=apps/vk

# --- Production stage ---
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/apps/vk/dist /usr/share/nginx/html
COPY deploy/vk/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
