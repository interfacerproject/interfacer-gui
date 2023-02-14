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

import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import { useAuth } from "./useAuth";
import useStorage from "./useStorage";

const useSignedPost = (idInHeader?: boolean) => {
  const { getItem } = useStorage();
  const { user } = useAuth();
  const signRequest = async (json: string) => {
    const data = `{"gql": "${Buffer.from(json, "utf8").toString("base64")}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsaPrivateKey")}"}}`;
    const { result } = await zencode_exec(sign(), { data, keys });
    const headers: { "zenflows-sign": string; "zenflows-id"?: string } = {
      "zenflows-sign": JSON.parse(result).eddsa_signature,
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
  return { signedPost };
};

export default useSignedPost;
