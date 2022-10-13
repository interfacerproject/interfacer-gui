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
    cy.screenshot();

    // Clicking the option
    cy.get(`[id$="listbox"]`).children("div").children("div").should("exist").eq(0).click();
    cy.screenshot();

    // Assert
    cy.get("@setContributors").should("have.been.calledWith", [mocks[0].result.data.agents.edges[0].node]);
  });
});
