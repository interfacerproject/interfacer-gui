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

import React = require("react");
import AddStar from "../../components/AddStar";
import { MockedProvider } from "@apollo/client/testing";
import "../../styles/globals.scss";
import { UPDATE_METADATA } from "../../lib/QueryAndMutation";

describe.skip("AddStar.cy.tsx", () => {
  const metadata = { starred: ["777777", "888888"] };
  const id = "999999";
  const projectId = "123456";
  const mocks = [
    {
      request: {
        query: UPDATE_METADATA,
        variables: {
          id: projectId,
          metadata: JSON.stringify({ starred: [...metadata.starred!, id] }),
        },
      },
      result: {
        data: {
          economicResource: {
            id: projectId,
          },
        },
      },
    },
  ];
  it("should mount and add star when a star is added", () => {
    cy.intercept("POST", `${process.env.NEXT_PUBLIC_API_URL}`, req => {
      expect(req.body.metadata.starred).to.include(id);
    });
    // Mounting component
    cy.mount(
      <MockedProvider addTypename={false} mocks={mocks}>
        <AddStar id={projectId} metadata={metadata} userId={id} />
      </MockedProvider>
    );

    // Visibility check
    cy.get("#addStar").should("be.visible");
    cy.contains("2").should("be.visible");
    cy.get("button > :nth-child(2)").should("have.text", "star");
    cy.get("button").click();
    cy.mount(
      <MockedProvider addTypename={false} mocks={mocks}>
        <AddStar id={projectId} metadata={{ starred: [...metadata.starred!, id] }} userId={id} />
      </MockedProvider>
    );
    cy.contains("3").should("be.visible");
    cy.get("button > :nth-child(2)").should("have.text", "unstar");
  });
});
