import React = require("react");
import AddStar from "../../components/AddStar";
import { MockedProvider } from "@apollo/client/testing";
import "../../styles/globals.scss";
import { UPDATE_METADATA } from "../../lib/QueryAndMutation";

describe("AddStar.cy.tsx", () => {
  const metadata = { starred: ["777777", "888888"] };
  const id = "999999";
  const projectId = "123456";
  const mocks = [
    {
      request: {
        query: UPDATE_METADATA,
        variables: {
          id: projectId,
          metadata: JSON.stringify({ starred: [...metadata.starred!, id] }),
        },
      },
      result: {
        data: {
          economicResource: {
            id: projectId,
          },
        },
      },
    },
  ];
  it("should mount and add star when a star is added", () => {
    cy.intercept("POST", `${process.env.NEXT_PUBLIC_API_URL}`, req => {
      expect(req.body.metadata.starred).to.include(id);
    });
    // Mounting component
    cy.mount(
      <MockedProvider addTypename={false} mocks={mocks}>
        <AddStar id={projectId} metadata={metadata} userId={id} />
      </MockedProvider>
    );

    // Visibility check
    cy.get("#addStar").should("be.visible");
    cy.contains("2").should("be.visible");
    cy.get("button > :nth-child(2)").should("have.text", "star");
    cy.get("button").click();
    cy.mount(
      <MockedProvider addTypename={false} mocks={mocks}>
        <AddStar id={projectId} metadata={{ starred: [...metadata.starred!, id] }} userId={id} />
      </MockedProvider>
    );
    cy.contains("3").should("be.visible");
    cy.get("button > :nth-child(2)").should("have.text", "unstar");
  });
});
