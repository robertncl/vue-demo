describe('Wanderlog', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads the travel app at the root url', () => {
    cy.contains('h1', 'Where to go this month')
    cy.contains('.brand', 'Wanderlog')
    cy.get('.nav a').should('have.length', 5)
  })

  it('shows the top pick for the current month', () => {
    cy.get('.top-pick').within(() => {
      cy.contains('.kicker', 'Top pick for')
      cy.get('.runner').should('have.length', 3)
      cy.contains('.acme-btn', 'Read the').click()
    })
    cy.location('pathname').should('match', /^\/destinations\/[a-z-]+$/)
  })

  it('switches language and currency across the app', () => {
    cy.get('.settings select').eq(1).select('EUR')
    cy.contains('.kicker', 'destinations')
    cy.get('.top-pick .figures').should('contain', '€')

    cy.get('.settings select').eq(0).select('fr')
    cy.get('.nav').should('contain', 'Destinations')
    cy.contains('h1', 'Où partir ce mois-ci')
    cy.get('html').should('have.attr', 'lang', 'fr')

    // the choice survives a reload
    cy.reload()
    cy.contains('h1', 'Où partir ce mois-ci')
    cy.get('.top-pick .figures').should('contain', '€')

    cy.get('.settings select').eq(0).select('en')
    cy.get('.settings select').eq(1).select('USD')
  })

  it('browses, filters and opens a destination', () => {
    cy.contains('.nav a', 'Destinations').click()
    cy.get('.destination-card').should('have.length', 12)

    cy.get('#f-query').type('japan')
    cy.get('.destination-card').should('have.length', 1).contains('Kyoto')

    cy.contains('.acme-btn', 'Clear all').click()
    cy.get('.destination-card').should('have.length', 12)

    cy.get('#f-region').select('Europe')
    cy.get('.destination-card').should('have.length.lessThan', 12)
    cy.contains('.destination-card', 'Lisbon').contains('a', 'Read the guide').click()

    cy.location('pathname').should('eq', '/destinations/lisbon')
    cy.contains('h1', 'Lisbon')
  })

  it('compares the catalog as a table and filters to what is in season', () => {
    cy.contains('.nav a', 'Destinations').click()

    cy.contains('.acme-tab', 'Compare table').click()
    cy.get('.compare tbody tr').should('have.length', 12)
    // the table is sorted by daily budget, cheapest first
    cy.get('.compare tbody tr').first().should('contain', 'Hanoi')

    cy.get('.acme-switch input').check()
    cy.get('.compare tbody tr').should('have.length.lessThan', 12)
    cy.get('.compare tbody tr').each(($row) => cy.wrap($row).should('contain', 'now'))
  })

  it('reads a full destination guide', () => {
    cy.visit('/destinations/kyoto')

    cy.get('.acme-breadcrumbs').should('contain', 'Destinations').and('contain', 'Kyoto')

    cy.contains('h2', 'Where to base yourself')
    cy.get('.area').should('have.length.at.least', 3)

    cy.contains('h2', 'A perfect three days')
    cy.get('.plan').should('have.length', 3)
    cy.contains('.plan', 'Fushimi Inari').should('contain', 'Morning')

    cy.contains('h2', 'What to eat')
    cy.contains('h2', 'Worth a day trip')
    cy.contains('h2', 'When to go')
    cy.get('.season').should('have.length.at.least', 3)

    cy.contains('h2', 'Know before you go')
    cy.get('.practical').should('contain', 'Plugs').and('contain', 'Visas')

    // where a day's money goes, one bar per line with a single highlighted lead
    cy.get('.bar .seg').should('have.length', 4)
    cy.get('.seg.leads').should('have.length', 1)
    cy.get('.legend').should('contain', 'Stay')
  })

  it('saves a destination to the shortlist', () => {
    cy.visit('/destinations/bali')
    cy.contains('button', 'Save to shortlist').click()
    cy.contains('button', 'Saved to shortlist')

    cy.contains('.nav a', 'Shortlist').click()
    cy.contains('.saved-row', 'Bali')

    cy.get('.saved-row .wish').click()
    cy.contains('Nothing saved yet')
  })

  it('plans a trip from a destination and tracks the budget', () => {
    cy.visit('/destinations/kyoto')
    cy.contains('a', 'Start a trip here').click()

    cy.location('pathname').should('eq', '/trips')
    cy.get('#destination').should('have.value', 'Kyoto, Japan')
    cy.get('#budget').should('have.value', '1015')

    cy.get('#startDate').type('2026-09-01')
    cy.get('#endDate').type('2026-09-05')
    cy.get('#budget').clear()
    cy.get('#budget').type('1000')
    cy.contains('button', 'Add trip').click()

    cy.contains('.trip-card', 'Kyoto, Japan').should('have.class', 'active')
    cy.contains('h2', 'Kyoto, Japan')
    cy.contains('5 days')

    cy.get('.activity-form input[type="text"]').type('Fushimi Inari hike')
    cy.get('.activity-form input[type="number"]').eq(1).clear()
    cy.get('.activity-form input[type="number"]').eq(1).type('40')
    cy.contains('.activity-form button', 'Add activity').click()

    cy.contains('.day-group tr', 'Fushimi Inari hike').should('contain', '$40')
    cy.contains('.budget', 'Spent')
    cy.contains('.budget', '$960')

    // prices re-denominate without changing the underlying trip
    cy.get('.settings select').eq(1).select('EUR')
    cy.contains('.budget', '€920')
    cy.get('.settings select').eq(1).select('USD')
    cy.contains('.budget', '$1,000')

    cy.contains('.day-group tr', 'Fushimi Inari hike').find('.remove').click()
    cy.contains('.trip-card', 'Kyoto, Japan').find('.remove').click()
    cy.contains('No trip selected')
  })

  it('shows a not-found page for unknown routes', () => {
    cy.visit('/nowhere', { failOnStatusCode: false })
    cy.contains('h1', 'Off the map')
    cy.contains('.acme-btn', 'Back to explore').click()
    cy.location('pathname').should('eq', '/')
  })
})
