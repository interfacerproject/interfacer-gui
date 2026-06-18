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


# TODO: move config to runtime https://github.com/vercel/next.js/discussions/17641

FROM node:lts-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /build

# Install ALL dependencies first (NODE_ENV is not set yet, so devDeps are included)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Set NODE_ENV only for the build step (Next.js reads it for optimizations)
ARG HOST=0.0.0.0
ENV HOST=$HOST
ARG PORT=3000
ENV PORT=$PORT
ENV NODE_ENV=production

RUN pnpm build

# ----
FROM node:lts-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production
ARG HOST=0.0.0.0
ENV HOST=$HOST
ARG PORT=3000
ENV PORT=$PORT

# Fresh install of production-only dependencies
COPY --from=builder /build/package.json /build/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy build output and runtime configs
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public
COPY --from=builder /build/next.config.js ./
COPY --from=builder /build/next-i18next.config.js ./

EXPOSE $PORT

CMD ["pnpm", "start"]
