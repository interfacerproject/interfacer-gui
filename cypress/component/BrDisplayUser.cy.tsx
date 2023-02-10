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
import BrDisplayUser from "../../components/brickroom/BrDisplayUser";
import "../../styles/globals.scss";

describe("BrDisplayUser component", () => {
  it("should mount and check that all the info are visible", () => {
    // Mounting component
    const name = "Mino";
    const location = "Bari";
    cy.mount(<BrDisplayUser id="1" name={name} location={location} />);

    // Visibility check
    cy.get("a").should("be.visible");
    cy.contains(name).should("be.visible");
    cy.contains(location).should("be.visible");
    cy.get("svg").should("be.visible");
  });

  // Functionality is tested here:
});
