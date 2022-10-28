import React = require("react");
import "../../styles/globals.scss";
import GeoCoderInput from "../../components/GeoCoderInput";

describe("AddContributors.cy.tsx", () => {
  const selectedMock = {
    lat: 40.84778,
    lng: 14.26187,
    address: {
      label: "Corso Umberto I, Napoli NA, Italia",
      value: {
        title: "Italia, Napoli, Corso Umberto I",
        id: "here:af:street:JexTaoFoucKMkV23ud5rLB",
        language: "it",
        resultType: "street",
        address: {
          label: "Corso Umberto I, Napoli NA, Italia",
          countryCode: "ITA",
          countryName: "Italia",
          state: "Campania",
          countyCode: "NA",
          county: "Napoli",
          city: "Napoli",
          street: "Corso Umberto I",
        },
        highlights: {
          title: [
            {
              start: 16,
              end: 28,
            },
          ],
          address: {
            label: [
              {
                start: 0,
                end: 12,
              },
            ],
            street: [
              {
                start: 0,
                end: 12,
              },
            ],
          },
        },
      },
    },
  };

  it("It should search for a location and select it", () => {
    cy.intercept("GET", `${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?q=*`, {
      fixture: "addresses.json",
    }).as("autocomplete");
    cy.intercept("GET", `${process.env.NEXT_PUBLIC_LOCATION_LOOKUP}?id=*`, {
      statusCode: 200,
      body: { position: { lat: 40.84778, lng: 14.26187 } },
    }).as("geoCode");
    const setSelected = cy.spy().as("setSelected");
    cy.mount(<GeoCoderInput onSelect={setSelected} selectedAddress={undefined} />);
    // Act
    cy.get("input").type("corso umb");
    cy.get("#react-select-2-option-0").should("exist").click();
    // Assert
    cy.get("@setSelected").should("have.been.called");
  });
});
