describe("LocationMenu component", () => {
    before(() => {
        cy.login();
        cy.saveLocalStorage();
    });

    it("should change the language to french", () => {
        cy.visit("/");

        // Getting "fr" language
        // (The order of languages in included in LocationMenu.tsx)
        getMenu().select(2);
        cy.wait(2000);
        cy.url().should("include", "/fr");
    });

    it("should check that text between two languages is different", () => {
        // Getting text from a button
        const item = ".ml-4.btn.btn-outline.btn-primary";

        cy.get(item).then((el) => {
            // Saving text from an item, in order to check its change
            const text = el.text();

            // Getting "de" lang
            getMenu().select(1);
            cy.wait(2000);
            cy.url().should("include", "/de");

            // Getting text again from the same item
            cy.get(item).then((el) => {
                // Checking that they're different
                expect(el.text()).not.to.eq(text);
            });
        });
    });
});

function getMenu() {
    return cy.get("select");
}

function getTitle() {
    return cy.get("div.mt-40").get(".logo");
}
