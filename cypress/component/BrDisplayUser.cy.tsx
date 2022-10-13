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
