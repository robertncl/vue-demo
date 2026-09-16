describe('Wanderlog', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads the travel app at the root url', () => {
    cy.contains('h1', 'Find somewhere worth the flight.')
    cy.contains('.brand', 'Wanderlog')
    cy.get('.nav a').should('have.length', 5)
  })

  it('browses, filters and opens a destination', () => {
    cy.contains('.nav a', 'Destinations').click()
    cy.get('.destination-card').should('have.length', 12)

    cy.get('#f-query').type('japan')
    cy.get('.destination-card').should('have.length', 1).contains('Kyoto')

    cy.contains('.btn', 'Reset').click()
    cy.get('.destination-card').should('have.length', 12)

    cy.get('#f-region').select('Europe')
    cy.get('.destination-card').should('have.length.lessThan', 12)
    cy.contains('.destination-card a', 'Lisbon').click()

    cy.location('pathname').should('eq', '/destinations/lisbon')
    cy.contains('h1', 'Lisbon')
    cy.contains("Don't miss")
  })

  it('saves a destination to the wishlist', () => {
    cy.visit('/destinations/bali')
    cy.contains('button', 'Save to wishlist').click()
    cy.contains('button', '★ Saved')

    cy.contains('.nav a', 'Wishlist').click()
    cy.contains('.destination-card', 'Bali')

    cy.get('.destination-card .wish').click()
    cy.contains('No saved destinations yet')
  })

  it('plans a trip from a destination and tracks the budget', () => {
    cy.visit('/destinations/kyoto')
    cy.contains('button', 'Plan a trip here').click()

    cy.location('pathname').should('eq', '/trips')
    cy.get('#destination').should('have.value', 'Kyoto, Japan')
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
    cy.contains('.budget', 'Spent')
    cy.contains('.budget', '$40')
    cy.contains('.budget', '$960')

    cy.contains('.day-group li', 'Fushimi Inari hike').find('.remove').click()
    cy.contains('.budget', '$1000')

    cy.contains('.trip-card', 'Kyoto, Japan').find('.remove').click()
    cy.contains('Select or create a trip to start planning the itinerary.')
  })

  it('shows a not-found page for unknown routes', () => {
    cy.visit('/nowhere', { failOnStatusCode: false })
    cy.contains('h1', 'Off the map')
    cy.contains('.btn', 'Go home').click()
    cy.location('pathname').should('eq', '/')
  })
})
