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

import React, { useState } from "react";
import base45 from "base45";
import QRCode from "react-qr-code";
import Popup from "./Popup";
import Spinner from "./Spinner";

const QrCodeButton = ({ id, outlined }: { id: string; outlined?: boolean }) => {
  const [result, setResult] = useState(undefined as string | undefined);

  const fetchQr = async () => {
    const data = {
      data: {
        reflow_data_to_post: {
          id: id,
          recurseLimit: 10,
          unwind: true,
        },
        reflow_endpoint: "https://reflow-demo.dyne.org/api/json/trace",
        sawroomEndpoint: "http://195.201.41.35:8008",
      },
    };

    const options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const url = "https://apiroom.net/api/ReflowDPP/Reflow-create-DPP-and-store-in-sawroom.chain";
    const res = await fetch(url, options);
    if (res.status === 200) {
      const json = await res.json();
      const compressed = base45.encode(JSON.stringify(json));
      setResult(compressed);
    }
  };

  return (
    <>
      <Popup name="fetchQr" action1="Generate" action2={fetchQr} outlined={outlined}>
        {result && (
          <div>
            <QRCode value={result} className="mx-auto" />
          </div>
        )}
        {!result && <Spinner />}
      </Popup>
    </>
  );
};

export default QrCodeButton;
