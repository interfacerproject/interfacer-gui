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
