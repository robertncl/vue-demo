/** The twelve languages: switching, lazy loading, and right-to-left layout. */
const titles: Record<string, string> = {
  en: 'Find your flight',
  es: 'Encuentra tu vuelo',
  fr: 'Trouvez votre vol',
  de: 'Finde deinen Flug',
  ja: 'フライトを探す',
  zh: '找到你的航班',
  hi: 'अपनी फ़्लाइट खोजें',
  ar: 'اعثر على رحلتك',
  bn: 'আপনার ফ্লাইট খুঁজুন',
  pt: 'Encontre seu voo',
  ru: 'Найдите свой рейс',
  ur: 'اپنی پرواز تلاش کریں',
}

const rtl = new Set(['ar', 'ur'])

function visitIn(locale: string, path = '/') {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('wanderlog-locale', locale)
    },
  })
}

describe('Languages', () => {
  it('switches between all twelve languages from the header', () => {
    cy.visit('/')
    cy.get('.settings select').eq(0).find('option').should('have.length', 12)

    for (const [code, title] of Object.entries(titles)) {
      cy.get('.settings select').eq(0).select(code)
      cy.get('html').should('have.attr', 'lang', code)
      cy.get('html').should('have.attr', 'dir', rtl.has(code) ? 'rtl' : 'ltr')
      cy.contains('h1', title)
    }
  })

  it('loads a saved language before the first render', () => {
    visitIn('ru')
    cy.contains('h1', 'Найдите свой рейс')
    cy.get('.nav').should('contain', 'Авиабилеты')
  })

  it('fetches only the language in use', () => {
    cy.intercept('GET', '**/assets/messages.*.js').as('bundle')
    visitIn('pt')
    cy.contains('h1', 'Encontre seu voo')
    cy.wait('@bundle').its('request.url').should('match', /messages\.pt-/)
    cy.get('@bundle.all').should('have.length', 1)
  })

  it('mirrors the layout in Arabic', () => {
    visitIn('ar')
    cy.get('html').should('have.attr', 'dir', 'rtl')
    cy.contains('h1', 'اعثر على رحلتك')

    // The brand moves to the right-hand end of the header, the nav to the left.
    cy.get('.brand').then(($brand) => {
      cy.get('.nav').then(($nav) => {
        expect($brand[0]!.getBoundingClientRect().left).to.be.greaterThan(
          $nav[0]!.getBoundingClientRect().left,
        )
      })
    })

    // Popovers anchor to their trigger's start edge, which is its right edge here.
    cy.get('.search-form .popover-trigger').first().click()
    cy.get('.popover-panel:popover-open').should('be.visible')
    cy.get('.search-form .popover-trigger')
      .first()
      .then(($trigger) => {
        cy.get('.popover-panel:popover-open').then(($panel) => {
          const trigger = $trigger[0]!.getBoundingClientRect()
          const panel = $panel[0]!.getBoundingClientRect()
          expect(Math.abs(panel.right - trigger.right)).to.be.lessThan(2)
        })
      })
  })

  it('searches and reads results in Urdu', () => {
    visitIn('ur')
    cy.get('input[name="to"]').type('KEF')
    cy.get('form[role="search"] button[type="submit"]').click()
    cy.location('pathname').should('eq', '/flights')
    cy.get('html').should('have.attr', 'dir', 'rtl')
    cy.get('.flight-row').should('have.length.greaterThan', 0)
    // Each row's spoken summary is in Urdu too.
    cy.get('.flight-row button.summary')
      .first()
      .invoke('attr', 'aria-label')
      .should('contain', 'روانگی')
  })
})
