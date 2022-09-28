describe("BrDisplayUser component", () => {
    before(() => {
        cy.login();
        cy.saveLocalStorage();
    });

    beforeEach(() => {
        cy.visit("/assets");
        cy.restoreLocalStorage();
    });

    it("should click the component and go to user page", () => {
        // Waiting for data
        const name = "dataGetFirst";
        cy.intercept("http://65.109.11.42:9000/api").as(name);
        cy.wait(`@${name}`);

        // Getting the first instance of the component
        const comp = cy.get("tr > td > a").first();
        // Checking if it's visible
        comp.should("be.visible");
        // Clicking to navigate
        comp.click().then((a) => {
            // Checking if url is correct
            cy.location("href").should("eq", a.prop("href"));
        });
    });
});
