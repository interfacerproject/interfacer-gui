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

import Head from "next/head";
import StepModelViewer from "../components/StepModelViewer";

const modelUrl = "/models/Ender3-V2.step";

const TestStepVisualizer = () => {
  return (
    <>
      <Head>
        <title>{"STEP Visualizer Test"}</title>
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #f6f4ef 0%, #f2efe8 50%, #ece8de 100%)",
          padding: "1.5rem",
        }}
      >
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>{"STEP Visualizer"}</h1>
          <p style={{ margin: 0, color: "#4a4740" }}>{"Model: /models/Ender3-V2.step"}</p>
          <StepModelViewer modelUrl={modelUrl} />
        </section>
      </main>
    </>
  );
};

export default TestStepVisualizer;
