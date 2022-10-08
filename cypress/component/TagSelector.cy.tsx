import React = require("react");
import TagSelector from "../../components/brickroom/TagSelector";
import "../../styles/globals.scss";

//

describe("TagSelector.cy.tsx", () => {
  it("should display the tag selector, input some tags and remove one", () => {
    /**
     * Setup
     */

    // Mounting component
    cy.mount(<TagSelector></TagSelector>);

    // Getting textarea
    const input = cy.get("textarea");

    // Function to select badges
    const getBadgeByText = (text: string) => {
      return cy.contains(text).filter(".badge");
    };

    /**
     * Checking if badge gets created
     */

    // Variables
    const word1 = "test";
    // Typing in input
    input.type(word1);
    // Getting badge
    const badge1 = getBadgeByText(word1);
    // Exists?
    badge1.should("exist");
    // Has text?
    badge1.should("include.text", word1);

    /**
     * Checking if other badges get created
     */

    for (const s of ["mario", "naso"]) {
      input.type(" ");
      input.type(s);
      getBadgeByText(s).should("exist");
    }

    /**
     * Deleting first badge
     */

    // Clicking the button
    badge1.children("button").click();
    // Checking that badge isn't visible anymore
    badge1.should("not.exist");
  });
});
