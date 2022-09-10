import Tabs from "../../components/Tabs";

describe('Tabs.cy.ts', () => {
    const tabsArray = [
        {
            title: 'Tab 1',
            component: "content tab 1"
        },
        {
            title: 'Tab 2',
            component: "content tab 2"
        }
    ];
    it('Tabs switch content correctly', () => {
        cy.mount(<Tabs tabsArray={tabsArray} />)
        cy.findByText('Tab 1').should('exist')
        cy.findByText('Tab 2').should('exist')
        cy.findByText('content tab 1').should('exist')
        cy.findByText('content tab 2').should('not.exist')
        cy.findByText('Tab 2').click()
        cy.findByText('content tab 2').should('exist')
    })
})
