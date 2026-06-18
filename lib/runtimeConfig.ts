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

/**
 * Runtime configuration accessor.
 *
 * These values are evaluated at request time (not build time),
 * allowing them to be set via container environment variables
 * even when NEXT_PUBLIC_* were not available during docker build.
 */
import getConfig from "next/config";

export function getRuntimeConfig() {
  const { publicRuntimeConfig } = getConfig() as {
    publicRuntimeConfig: { zenflowsUrl: string; zenflowsFileUrl: string; dppUrl: string };
  };
  return publicRuntimeConfig;
}
