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
import { MockedProvider } from "@apollo/client/testing";
import AddContributors, { QUERY_AGENTS } from "../../components/AddContributors";
import "../../styles/globals.scss";

describe("AddContributors.cy.tsx", () => {
  const mocks = [
    {
      request: {
        query: QUERY_AGENTS,
      },
      result: {
        data: {
          agents: {
            edges: [
              {
                cursor: "061F65P3N9DKA1GQVYQE5N7E3W",
                node: {
                  id: "061F65P3N9DKA1GQVYQE5N7E3W",
                  name: "test1",
                },
              },
              {
                cursor: "061F65P3N9DKA1GQVYQE5N7E4F",
                node: {
                  id: "061F65P3N9DKA1GQVYQE5N7E4F",
                  name: "test2",
                },
              },
            ],
          },
        },
      },
    },
  ];

  it("should select an id by typing some search string and selecting from the list", () => {
    const setContributors = cy.spy().as("setContributors");
    cy.mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddContributors contributors={[]} setContributors={setContributors} />
      </MockedProvider>
    );

    // Act
    cy.get("input").type("test");

    // Clicking the option
    cy.get(`[id$="listbox"]`).children("div").children("div").should("exist").eq(0).click();

    // Assert
    cy.get("@setContributors").should("have.been.calledWith", [mocks[0].result.data.agents.edges[0].node]);
  });
});
