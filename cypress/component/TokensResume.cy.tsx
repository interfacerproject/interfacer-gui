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
import TokensResume from "../../components/TokensResume";
import "../../styles/globals.scss";

describe("TokensResume.cy.tsx", () => {
  const id = "999999";
  const idea = "idea";
  const strengths = "strengths";
  const ideaPoints = 2;
  const strengthsPoints = 8;
  it("should mount and display the correct values for Idea points", () => {
    cy.intercept(
      {
        method: "GET",
        url: `/wallet/token/${idea}/*`,
      },
      { amount: ideaPoints, success: true }
    ).as("getPoints");

    // Mounting component
    cy.mount(<TokensResume id={id} stat={idea} />);

    // Visibility check
    cy.get(".stat").should("be.visible");
    cy.get(".stat-figure").should("be.visible");
    cy.get(".stat-title").should("be.visible");
    cy.get(".stat-value").should("be.visible").and("have.text", "2");
  });
  it("should mount and display the correct values for Strengths points", () => {
    cy.intercept(
      {
        method: "GET", // Route all GET requests
        url: `/wallet/token/${strengths}/*`, // that have a URL that matches '/users/*'
      },
      { amount: strengthsPoints, success: true } // and force the response to be: []
    ).as("getPoints"); // and assign an alias
    // Mounting component
    cy.mount(<TokensResume id={id} stat={strengths} />);

    // Visibility check
    cy.get(".stat").should("be.visible");
    cy.get(".stat-figure").should("be.visible");
    cy.get(".stat-title").should("be.visible");
    cy.get(".stat-value").should("be.visible").and("have.text", "8");
  });
});
