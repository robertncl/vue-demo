describe('Travel Planner', () => {
  it('creates a trip, adds an activity, and updates the budget', () => {
    cy.visit('/travel')
    cy.contains('a', 'Travel Planner').click()

    cy.get('#destination').type('Kyoto, Japan')
    cy.get('#startDate').type('2026-09-01')
    cy.get('#endDate').type('2026-09-05')
    cy.get('#budget').clear()
    cy.get('#budget').type('1000')
    cy.contains('button', 'Add trip').click()

    cy.contains('.trip-card', 'Kyoto, Japan').should('have.class', 'active')
    cy.contains('h2', 'Kyoto, Japan')
    cy.contains('5 day trip')

    cy.get('.activity-form input[type="text"]').type('Fushimi Inari hike')
    cy.get('.activity-form input[type="number"]').eq(1).clear()
    cy.get('.activity-form input[type="number"]').eq(1).type('40')
    cy.contains('.activity-form button', 'Add').click()

    cy.contains('.day-group li', 'Fushimi Inari hike').should('contain', '$40')
    cy.contains('.budget', 'Spent $40')
    cy.contains('.budget', 'Remaining $960')

    cy.contains('.day-group li', 'Fushimi Inari hike').find('.remove').click()
    cy.contains('.budget', 'Spent $0')

    cy.contains('.trip-card', 'Kyoto, Japan').find('.remove').click()
    cy.contains('Select or create a trip to start planning the itinerary.')
  })
})
