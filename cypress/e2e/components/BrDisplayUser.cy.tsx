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
        // Getting the first instance
        const comp = cy.get("tr > td > a").first().should("be.visible");
        // // Getting the text inside the istance (the username)
        // let text = "";
        // comp.then(function ($elem) {
        //     text = $elem.text();
        // });
        // cy.log(text);
    });
});
