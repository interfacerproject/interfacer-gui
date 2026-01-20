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
/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: false,
// });
// const withPlugin = require("next-compose-plugins");
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  transpilePackages: ["react-markdown-editor-lite"],
  webpack: config => {
    config.resolve.fallback = {
      fs: false,
      process: false,
      path: false,
      crypto: false,
    };

    config.module.rules.push({
      test: /\.(zen|lua|json)$/,
      type: "asset/source",
    });

    // Handle ESM modules that need to be used in CommonJS context
    config.resolve.alias = {
      ...config.resolve.alias,
      nanoid: require.resolve("nanoid"),
    };

    return config;
  },
};

module.exports = nextConfig;
