# Wanderlog — a Vue 3 flight search and travel planner

[![Build and Deploy](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml/badge.svg)](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml)

Wanderlog is a self-contained flight search and travel planner, modelled on the way Google Flights
works: search a route, compare fares across dates, see whether today's price is a good one, track
it, and turn the flights you pick into a dated, budgeted trip — with a destination guide to go
with it.

It replaces the default Vue scaffold entirely — the travel app is the only thing this project
serves, starting at `/`.

## Features

- **Flight search** — round trip or one way, up to nine travellers (adults, children, lap infants), four cabins, and airport fields that accept a code, a city or the `City (CODE)` label from a native `<datalist>`. The search lives in the URL, so results can be shared and bookmarked.
- **Results** — Best / Cheapest / Fastest sorting, filter chips for stops, airlines, price, departure and arrival times and duration, expandable rows with every leg, layover, aircraft, flight number, legroom and emissions estimate, then a departing → returning → booking flow.
- **Date tools** — a strip of the cheapest price three days either side, a 7 × 7 date grid, a 60-day price graph and a price insight that says whether today's fare is low, typical or high.
- **Price tracking** — follow a search and see today's cheapest fare, the change since you started and its last 30 days on a chart.
- **Explore** — every guide destination priced from your airport for a weekend, a week or two weeks in a chosen month.
- **Booking into the planner** — an itemised fare summary that becomes a trip with the flights on day one and the last day, budgeted for the fare plus the guide's daily budget.
- **Top pick of the month** — destinations ranked by whether they're in season now, with value breaking ties, plus three runners-up and a reason for the month.
- **Guides** — twelve destinations filterable by search text, region, vibe, max daily budget and what's in season, shown as cards or a side-by-side compare table.
- **In-depth guides** — multi-paragraph orientation, where to base yourself, a costed three-day itinerary, what to eat, day trips, season-by-season notes, a practical pre-departure panel and a daily-budget breakdown.
- **Five languages** — English, Español, Français, Deutsch and 日本語, switchable at any time.
- **Six currencies** — USD, EUR, GBP, JPY, AUD and CAD, converted from a USD base at fixed reference rates.
- **Shortlist** — save destinations and compare them on price and season; the list persists in `localStorage`.
- **Trip planner** — create dated trips (by hand or from a booking), add activities per day, and watch the budget bar.
- Responsive layout and a proper 404 route.
- Built on the **ACME design system** — its tokens and component classes are ported into `src/assets/acme.css`.

## Design system

The UI is built on the ACME design system (v3). `src/assets/acme.css` is a port of that system's
stylesheet — every token plus the `.acme-*` classes for buttons, forms, cards,
badges, alerts, tables, tabs, the top bar and breadcrumbs. Sections the app has no use for
(modal, presentation slides, report documents) are left out. `src/assets/main.css` is the thin
app layer on top: the page well, the section kicker, the card grid; it introduces no new colour,
type or spacing values, only compositions of the tokens.

ACME v3 is a cool Slate base with a single Cobalt highlight, and it is **light theme only**: there
is no `prefers-color-scheme` override and no theme switch, so the app looks the same whatever the
system preference.

Two of ACME's rules shape the content directly:

- **No emoji, no gradients.** Destination art is a flat `surface` panel naming the photograph
  that would sit there (`DestinationMedia`), which is what the design's own image slot renders
  when unfilled. The app ships no photography.
- **Cobalt is rationed.** The one accent carries both action (the single primary button per view)
  and orientation (current nav link, selected tab and trip, the leading bar in the budget
  breakdown). Everything else is neutral Slate.

## How the flights work

There is no backend and no flight API: [`src/lib/flights.ts`](src/lib/flights.ts) generates
schedules and fares, deterministically, so the same search always returns the same flights.

- **Network.** The airports in [`src/data/airports.ts`](src/data/airports.ts) are real (every
  guide destination has one — Kyoto flies into Osaka Kansai); the airlines in
  [`src/data/airlines.ts`](src/data/airlines.ts) are fictional and fly only from their hubs.
  Itineraries are nonstops plus one- and two-stop connections through hubs, kept only when the
  detour is reasonable.
- **Schedules.** A route keeps its flight numbers and departure time every day it operates;
  times are local at each airport (standard time — daylight saving is ignored), so arrivals can
  land a day later, or earlier across the date line.
- **Fares** follow a booking curve (dear inside three weeks, flat between three weeks and three
  months), the day of the week, the destination's season from the guide data and holiday peaks,
  with seeded noise per day and per flight. Prices are stored in USD like everything else.
- **"Today" is a store ref** (`useFlightsStore().today`), so the price history, insights and
  every test can pin the date.

Query strings are untrusted input: [`src/lib/flightSearch.ts`](src/lib/flightSearch.ts)
validates airports against the list, dates for format, existence and the booking window, and
traveller counts as plain digits within the booking rules, before the engine sees them. Tracked
searches read back from `localStorage` are shape-checked the same way.

The passenger picker and filter chips are native popovers; browsers without the Popover API get
[`@oddbird/popover-polyfill`](https://github.com/oddbird/popover-polyfill), loaded on demand
only when it's missing. Its styles go in through constructable stylesheets, which the
production Content-Security-Policy allows. The date grid and price graph are native modal
`<dialog>`s.

## Languages and currencies

Language and currency live in a Pinia `settings` store and persist to `localStorage`, alongside
`<html lang>` and the document title.

Money is **always stored in USD**, the base currency. The UI converts on the way out via
`money()`, and money _inputs_ convert back to USD on submit — so switching currency
re-denominates the number in the field without changing the real value of the trip. Rates are
fixed reference rates in [`src/i18n/config.ts`](src/i18n/config.ts), not live ones.

The i18n layer is dependency-free (about 80 lines in [`src/i18n/index.ts`](src/i18n/index.ts)):
dotted-key lookup with `{named}` interpolation, falling back to English and then to the key
itself, plus `Intl` for number, currency, date, time, duration (`Intl.DurationFormat`, with a
fallback) and plural formatting (`Intl.PluralRules`). Each translation file is typed as
`Messages`, so a missing key is a **compile error** rather than a blank label.

One limitation worth naming: the **UI chrome is translated, but the long-form guide prose is
not** — destination overviews, neighbourhood descriptions and itineraries stay in English in
every language. Translating that content is a copywriting job rather than a code one.

## Routes

| Path                  | View                    | Purpose                                       |
| --------------------- | ----------------------- | --------------------------------------------- |
| `/`                   | `HomeView`              | Flight search, cheap flights, top pick        |
| `/flights`            | `FlightResultsView`     | Results, filters, date tools, return step     |
| `/flights/booking`    | `BookingView`           | Fare summary; add the flights to your trips   |
| `/explore`            | `ExploreView`           | Destinations priced from your airport         |
| `/tracked`            | `TrackedView`           | Tracked searches with price history           |
| `/destinations`       | `DestinationsView`      | Filterable catalog                            |
| `/destinations/:slug` | `DestinationDetailView` | Full destination guide           |
| `/wishlist`           | `WishlistView`          | Saved destinations               |
| `/trips`              | `TripsView`             | Trip + itinerary planner         |
| `/about`              | `AboutView`             | What this app is                 |
| `*`                   | `NotFoundView`          | 404                              |

Every route except `/` is lazy-loaded into its own chunk.

## Project structure

```
src/
├── data/
│   ├── destinations.ts         # the destination catalog and guide content
│   ├── airports.ts             # real airports, hubs and catalog destinations
│   └── airlines.ts             # fictional airlines and their hubs
├── lib/
│   ├── flights.ts              # the flight engine: routes, schedules, fares, insights
│   ├── flightSearch.ts         # URL <-> search, validation of untrusted input
│   ├── flightFilters.ts        # results filters
│   ├── deals.ts                # cheapest trips for the home and explore pages
│   ├── dates.ts, random.ts, chart.ts
├── types/                      # travel.ts and flights.ts
├── i18n/
│   ├── config.ts               # currencies, locales and exchange rates
│   ├── index.ts                # useI18n(): t(), money(), month(), region(), tag()
│   └── messages.{en,es,fr,de,ja}.ts
├── stores/
│   ├── destinations.ts         # catalog, filters, wishlist, top pick of the month
│   ├── flights.ts              # today, last search, tracked searches, home airport
│   ├── settings.ts             # language, currency, USD conversion
│   └── travel.ts               # trips, itineraries, budget math
├── assets/
│   ├── acme.css                # ACME design system: tokens, base and .acme-* classes
│   └── main.css                # app layer composed from those tokens
├── components/
│   ├── layout/                 # AppHeader, AppFooter, SettingsMenu
│   ├── flights/                # search form, popovers, rows, filters, date tools, charts
│   ├── destinations/           # DestinationCard, DestinationMedia, TopPick
│   └── travel/                 # TripForm, TripList, ItineraryPlanner
└── views/                      # one component per route
```

State lives in four Pinia setup stores, all persisted to `localStorage`. There is no backend —
clearing site data clears your trips, tracked flights, wishlist and preferences.

### How the top pick is chosen

`destinations.ts` scores every destination for the current month: being in season dominates,
having a written note for that month adds a little, and a lower daily budget breaks ties so the
ranking favours value. The store's `today` is a ref, so tests can pin the month and assert the
result deterministically. If nothing is peaking — August, in the current catalog — the section
says so and falls back to the best all-rounders.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

Covers the flight engine (route network, schedules, fares, date tools, ranking), URL parsing and
validation, filters, the four stores, the i18n layer, the router, the flight search form, flight
rows and the results, booking, tracked and explore views, plus the destination and trip
components. A localisation suite mounts the whole app in all five languages across every route —
including results and booking pages — and fails if an untranslated key reaches the DOM.

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server. `cypress/e2e/flights.cy.ts`
drives the flight journeys end to end, from search through filters and the return step to a
booked trip in the planner.

If Cypress fails to start with `bad option: --no-sandbox` from inside VS Code, the editor has
leaked `ELECTRON_RUN_AS_NODE=1` into the terminal; run it with `env -u ELECTRON_RUN_AS_NODE`.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
