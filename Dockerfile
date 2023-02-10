# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
ARG NEXT_PUBLIC_LOSH_ID=""
ENV NEXT_PUBLIC_LOSH_ID=$NEXT_PUBLIC_LOSH_ID
ARG NEXT_PUBLIC_ZENFLOWS_ADMIN=""
ENV NEXT_PUBLIC_ZENFLOWS_ADMIN=$NEXT_PUBLIC_ZENFLOWS_ADMIN
ARG NEXT_PUBLIC_INVITATION_KEY=""
ENV NEXT_PUBLIC_INVITATION_KEY=$NEXT_PUBLIC_INVITATION_KEY

RUN apk add --no-cache libc6-compat
RUN wget "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -O /bin/pnpm && \
    chmod +x /bin/pnpm

WORKDIR /build

COPY . .

RUN pnpm install --frozen-lockfile && \
    pnpm build

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