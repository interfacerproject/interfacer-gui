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

import { useAuth } from "./useAuth";
import { signGraphQLRequest, signDidRequest } from "@dyne/interfacer-client";

const useSignedPost = (idInHeader?: boolean) => {
  const { user, client } = useAuth();

  const signRequest = async (json: string) => {
    if (!client) throw new Error("Client not ready");
    const signed = await signGraphQLRequest(json, client.store);
    const headers: Record<string, string> = {
      "zenflows-sign": signed["zenflows-sign"],
      "Content-Type": "application/json",
    };
    if (idInHeader) {
      headers["zenflows-id"] = String(user?.ulid);
    }
    return headers;
  };

  const signedPost = async (url: string, request: any) => {
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);
    return await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(request),
    });
  };

  return { signedPost, signRequest };
};

export default useSignedPost;
