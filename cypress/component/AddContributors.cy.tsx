import React = require("react");
import AddContributors from "../../components/AddContributors";
import { MockedProvider } from "@apollo/client/testing";
import { QUERY_AGENTS } from "../../components/AddContributors";
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
    cy.get("#react-select-2-option-0").should("exist").click();
    // Assert
    cy.get("@setContributors").should("have.been.calledWith", [{ name: "test1", id: "061F65P3N9DKA1GQVYQE5N7E3W" }]);
  });
});
