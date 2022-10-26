FROM node:lts-alpine AS builder

ARG HOST=0.0.0.0
ENV HOST=$HOST
ARG PORT=3000
ENV PORT=$PORT
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
ARG BASE_URL=http://localhost
ENV BASE_URL=$BASE_URL
ARG NEXT_PUBLIC_ZENFLOWS_URL=$BASE_URL/zenflows/api
ENV NEXT_PUBLIC_ZENFLOWS_URL=$NEXT_PUBLIC_ZENFLOWS_URL
ARG NEXT_PUBLIC_ZENFLOWS_FILE_URL=$BASE_URL/zenflows/api/file
ENV NEXT_PUBLIC_ZENFLOWS_FILE_URL=$NEXT_PUBLIC_ZENFLOWS_FILE_URL
ARG NEXT_PUBLIC_LOCATION_AUTOCOMPLETE=$BASE_URL/location-autocomplete/
ENV NEXT_PUBLIC_LOCATION_AUTOCOMPLETE=$NEXT_PUBLIC_LOCATION_AUTOCOMPLETE
ARG NEXT_PUBLIC_LOCATION_LOOKUP=$BASE_URL/location-lookup/
ENV NEXT_PUBLIC_LOCATION_LOOKUP=$NEXT_PUBLIC_LOCATION_LOOKUP
ARG NEXT_PUBLIC_LOASH_ID=""
ENV NEXT_PUBLIC_LOASH_ID=$NEXT_PUBLIC_LOASH_ID
ARG NEXT_PUBLIC_ZENFLOWS_ADMIN=""
ENV NEXT_PUBLIC_ZENFLOWS_ADMIN=$NEXT_PUBLIC_ZENFLOWS_ADMIN
ARG NEXT_PUBLIC_INVITATION_KEY=""
ENV NEXT_PUBLIC_INVITATION_KEY=$NEXT_PUBLIC_INVITATION_KEY

RUN apk add --no-cache                  \
        libc6-compat                    \
        yarn

WORKDIR /build

COPY . .

RUN yarn install --frozen-lockfile &&   \
    yarn build

FROM node:lts-alpine AS worker

WORKDIR /app

COPY --chown=node --from=builder /build/package.json            ./
COPY --chown=node --from=builder /build/next.config.js          ./
COPY --chown=node --from=builder /build/next-i18next.config.js  ./
COPY --chown=node --from=builder /build/node_modules            ./node_modules
COPY --chown=node --from=builder /build/public                  ./public
COPY --chown=node --from=builder /build/.next                   ./.next

USER node

EXPOSE $NODE_PORT

CMD [ "npm", "start" ]