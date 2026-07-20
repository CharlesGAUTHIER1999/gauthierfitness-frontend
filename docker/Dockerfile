# -----------------
# Stage 1 - Build
# -----------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

COPY . .
# VITE_API_URL injected at build time via --build-arg
ARG VITE_API_URL=http://localhost/api
ARG VITE_STRIPE_PUBLIC_KEY=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

RUN npm run build

# -----------------
# Stage 2 - Serve
# -----------------
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
