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
