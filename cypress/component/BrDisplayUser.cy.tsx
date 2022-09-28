import React = require("react");
import BrDisplayUser from "../../components/brickroom/BrDisplayUser";
import "../../styles/globals.scss";

describe("AddContributors.cy.tsx", () => {
    it("something", () => {
        /**
         * Setup
         */

        // Mounting component
        const name = "Mino";
        const location = "Bari";
        cy.mount(<BrDisplayUser id="1" name={name} location={location} />);

        // Visibility check
        cy.contains(name).should("be.visible");
        cy.contains(location).should("be.visible");
        cy.get("svg").should("be.visible");

        // Click on link does not work because <link> works inside the app
        // Not in component testing
    });
});
