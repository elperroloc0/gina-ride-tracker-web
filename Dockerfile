# Produces the static frontend bundle - this image is never run as a long-lived
# server. GinaGymnastics/compose.yaml's one-shot `frontend-build` service runs
# this image's default command, which copies dist/ into a shared named volume
# that Caddy (not this image) then serves; see GinaGymnastics/Caddyfile.
FROM node:20-alpine

WORKDIR /app

# The whole repo (including design/ds's source) has to be present before
# `npm ci` runs: the root package's own `prepare` script builds design/ds,
# and that needs its source tree, not just its package.json.
COPY . .

# VITE_MAPBOX_TOKEN is inlined into the JS bundle at *build* time by Vite,
# so it has to be a Docker build arg, not a runtime env var like the
# backend's - changing it means rebuilding this image, not just restarting
# a container.
ARG VITE_MAPBOX_TOKEN
ENV VITE_MAPBOX_TOKEN=${VITE_MAPBOX_TOKEN}

RUN npm ci
RUN npm run build

CMD ["sh", "-c", "cp -r /app/dist/. /out/"]
