// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

module.exports = {
  apps: [
    {
      name: "interfacer-gui",
      time: true,
      autorestart: true,
      max_restarts: 50,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      exec_mode: "cluster",
      instances: 0,
      listen_timeout: 12000,
      wait_ready: true,
      watch: false,
      env: {
        PORT: 3040,
      },
    },
  ],
  deploy: {
    baloo: {
      host: "deploy_staging",
      ref: "origin/main",
      repo: "https://github.com/dyne/interfacer-gui",
      path: "/root/interfacer-gui",
      "pre-deploy": "git submodule update --init --recursive",
      "post-deploy": "pnpm install && pnpm build && pnpm reload",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
