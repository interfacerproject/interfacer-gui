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
import BrBreadcrumb from "../../components/brickroom/BrBreadcrumb";
import "../../styles/globals.scss";

describe("BrBreadcrumb component", () => {
  it("should mount and check that all the info are visible", () => {
    // Mounting component
    cy.mount(
      <BrBreadcrumb
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/resources" },
          { name: "Imported from Losh", href: "/resources" },
        ]}
      />
    );

    cy.get("a").should("have.length", 3).should("have.attr", "href").and("oneOf", ["/", "/resources"]);
    cy.get("li").should("have.length", 3).should("have.text", "HomeResourcesImported from Losh");
  });
});
