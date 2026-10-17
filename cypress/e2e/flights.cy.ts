/** Flight search journeys. Dates come from the form's defaults, so these run on any day. */

describe('Flights', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('searches, filters and books a round trip into the planner', () => {
    cy.get('input[name="from"]').clear()
    cy.get('input[name="from"]').type('London (LHR)')
    cy.get('input[name="to"]').type('Osaka (KIX)')
    cy.contains('button', 'Search flights').click()

    cy.location('pathname').should('eq', '/flights')
    cy.location('search').should('contain', 'from=LHR').and('contain', 'to=KIX')
    cy.contains('h1', 'London to Osaka')
    cy.contains('h2', 'Top departing flights')

    // A native popover: its chip opens it and closes it again.
    cy.contains('.popover-trigger', 'Stops').click()
    cy.contains('.popover-trigger', 'Stops').should('have.attr', 'aria-expanded', 'true')
    cy.get('.popover-panel:popover-open').should('be.visible').within(() => {
      cy.contains('label', '1 stop or fewer').click()
    })
    cy.contains('.popover-trigger', '1 stop or fewer').click()
    cy.get('.popover-panel:popover-open').should('not.exist')
    cy.contains('.popover-trigger', '1 stop or fewer').should('have.attr', 'aria-expanded', 'false')
    cy.contains('.popover-trigger', '1 stop or fewer').should('have.class', 'active')

    cy.get('.flight-row button.summary').first().click()
    cy.get('.flight-row .details').should('be.visible')
    cy.contains('.flight-row .select', 'Select flight').click()

    cy.location('search').should('contain', 'out=')
    cy.contains('Your departing flight')
    cy.contains('.steps [aria-current="step"]', 'Returning flight')

    cy.get('.list-section .flight-row button.summary').first().click()
    cy.get('.list-section .flight-row .select').first().click()

    cy.location('pathname').should('eq', '/flights/booking')
    cy.contains('h1', 'London to Osaka')
    cy.get('.fares .total').invoke('text').should('match', /^\$[\d,]+$/)
    cy.contains('button', 'Add to my trips').click()

    cy.location('pathname').should('eq', '/trips')
    cy.contains('.trip-card', 'Kyoto, Japan').should('have.class', 'active')
    cy.get('.day-group').should('have.length', 2)
    cy.contains('.day-group tr', 'LHR → KIX')
    cy.contains('.day-group tr', 'KIX → LHR')
  })

  it('counts travellers within the booking rules', () => {
    cy.contains('.popover-trigger', '1 traveller').click()
    cy.get('.popover-panel:popover-open').within(() => {
      cy.get('[aria-label="Remove an adult"]').should('be.disabled')
      cy.get('[aria-label="Add a child"]').click()
      cy.get('[aria-label="Add an infant"]').click()
      cy.get('[aria-label="Add an infant"]').should('be.disabled')
      cy.contains('button', 'Done').click()
    })
    cy.get('.popover-panel:popover-open').should('not.exist')
    cy.contains('.popover-trigger', '3 travellers')
  })

  it('validates the form before searching', () => {
    cy.get('input[name="to"]').type('Atlantis')
    cy.get('input[name="depart"]').focus()
    cy.contains('We don’t fly there yet')
    cy.contains('button', 'Search flights').click()
    cy.get('[role="alert"]').should('contain', 'Choose where you’re flying to.')
    cy.focused().should('have.attr', 'name', 'to')
    cy.location('pathname').should('eq', '/')
  })

  it('re-dates a search from the date strip and the date grid', () => {
    cy.get('input[name="to"]').type('LIS')
    cy.contains('button', 'Search flights').click()
    cy.location('pathname').should('eq', '/flights')

    cy.location('search').then((before) => {
      cy.get('.date-strip .day').eq(4).click()
      cy.location('search').should('not.eq', before)
    })
    cy.get('.date-strip .day').eq(3).should('have.attr', 'aria-current', 'date')

    cy.contains('.tool-buttons button', 'Date grid').click()
    cy.get('dialog[open] .date-grid').should('be.visible')
    cy.get('dialog[open] .cell').first().click()
    cy.get('dialog[open]').should('not.exist')
    cy.get('.date-strip .day').eq(3).should('have.attr', 'aria-current', 'date')

    cy.contains('.tool-buttons button', 'Price graph').click()
    cy.get('dialog[open] .slot').should('have.length', 60)
    cy.get('dialog[open] .close').click()
    cy.get('dialog[open]').should('not.exist')
  })

  it('tracks a search and follows it on the tracked page', () => {
    cy.get('input[name="to"]').type('KEF')
    cy.contains('button', 'Search flights').click()
    cy.contains('.acme-switch', 'Track prices').find('input').check()
    cy.contains('You’re tracking this search.')
    cy.contains('.nav a', 'Tracked').should('contain', '1').click()

    cy.contains('.tracked-card h2', 'New York to Reykjavík')
    cy.get('.tracked-card .hero').invoke('text').should('match', /\$[\d,]+/)
    cy.get('.tracked-card svg[role="img"]').should('exist')

    cy.contains('button', 'Stop tracking').click()
    cy.contains('No tracked flights yet')
  })

  it('explains a broken or tampered link instead of searching', () => {
    cy.visit('/flights?from=LHR&to=%3Cscript%3E&depart=2020-01-01&adults=12')
    cy.get('[role="alert"]')
      .should('contain', 'Choose where you’re flying to.')
      .and('contain', 'Pick a departure date')
      .and('contain', 'Check the travellers')
    cy.get('.flight-row').should('not.exist')
  })

  it('explores destinations by month and opens their flights', () => {
    cy.contains('.nav a', 'Explore').click()
    cy.contains('h1', 'Where can you go from New York?')
    cy.get('.deal-card').should('have.length.greaterThan', 5)

    cy.get('select[name="region"]').select('Asia')
    cy.get('.deal-card').should(($cards) => {
      expect($cards.length).to.be.greaterThan(0)
      $cards.each((_, card) => expect(card.textContent).to.contain('Asia'))
    })

    cy.get('.deal-card').first().contains('a', 'View flights').click()
    cy.location('pathname').should('eq', '/flights')
    cy.get('.flight-row').should('exist')
  })
})
