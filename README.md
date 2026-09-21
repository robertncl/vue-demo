# Wanderlog — a Vue 3 travel planner

[![Build and Deploy](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml/badge.svg)](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml)

Wanderlog is a self-contained travel app: browse a curated catalog of destinations, save the ones
you like, and turn them into dated trips with a costed, day-by-day itinerary that tracks spend
against your budget.

It replaces the default Vue scaffold entirely — the travel app is the only thing this project
serves, starting at `/`.

## Features

- **Explore** — a landing page with search, the month's top pick, featured value and your next departure.
- **Top pick of the month** — destinations ranked by whether they're in season now, with value breaking ties, plus three runners-up and a reason for the month.
- **Destinations** — twelve destinations filterable by search text, region, vibe, max daily budget and what's in season, shown as cards or a side-by-side compare table.
- **In-depth guides** — multi-paragraph orientation, where to base yourself, a costed three-day itinerary, what to eat, day trips, season-by-season notes, a practical pre-departure panel and a daily-budget breakdown.
- **Five languages** — English, Español, Français, Deutsch and 日本語, switchable at any time.
- **Six currencies** — USD, EUR, GBP, JPY, AUD and CAD, converted from a USD base at fixed reference rates.
- **Shortlist** — save destinations and compare them on price and season; the list persists in `localStorage`.
- **Trip planner** — create dated trips, add activities per day, and watch the budget bar.
- Responsive layout, automatic light/dark theming, and a proper 404 route.
- Built on the **ACME design system** — its tokens and component classes are ported into `src/assets/acme.css`.

## Design system

The UI is built on the ACME design system. `src/assets/acme.css` is a port of that system's
stylesheet — every token (light and dark) plus the `.acme-*` classes for buttons, forms, cards,
badges, alerts, tables, tabs, the top bar and breadcrumbs. Sections the app has no use for
(modal, presentation slides, report documents) are left out. `src/assets/main.css` is the thin
app layer on top: the page well, the section kicker, the card grid; it introduces no new colour,
type or spacing values, only compositions of the tokens.

Two of ACME's rules shape the content directly:

- **No emoji, no gradients.** Destination art is a flat `surface` panel naming the photograph
  that would sit there (`DestinationMedia`), which is what the design's own image slot renders
  when unfilled. The app ships no photography.
- **Clay is rationed.** The one accent carries both action (the single primary button per view)
  and orientation (current nav link, selected tab and trip, the leading bar in the budget
  breakdown). Everything else is warm neutral Oat.

## Languages and currencies

Language and currency live in a Pinia `settings` store and persist to `localStorage`, alongside
`<html lang>` and the document title.

Money is **always stored in USD**, the base currency. The UI converts on the way out via
`money()`, and money _inputs_ convert back to USD on submit — so switching currency
re-denominates the number in the field without changing the real value of the trip. Rates are
fixed reference rates in [`src/i18n/config.ts`](src/i18n/config.ts), not live ones.

The i18n layer is dependency-free (about 80 lines in [`src/i18n/index.ts`](src/i18n/index.ts)):
dotted-key lookup with `{named}` interpolation, falling back to English and then to the key
itself, plus `Intl` for number and currency formatting. Each translation file is typed as
`Messages`, so a missing key is a **compile error** rather than a blank label.

One limitation worth naming: the **UI chrome is translated, but the long-form guide prose is
not** — destination overviews, neighbourhood descriptions and itineraries stay in English in
every language. Translating that content is a copywriting job rather than a code one.

## Routes

| Path                  | View                    | Purpose                          |
| --------------------- | ----------------------- | -------------------------------- |
| `/`                   | `HomeView`              | Hero, search, top pick, featured |
| `/destinations`       | `DestinationsView`      | Filterable catalog               |
| `/destinations/:slug` | `DestinationDetailView` | Full destination guide           |
| `/wishlist`           | `WishlistView`          | Saved destinations               |
| `/trips`              | `TripsView`             | Trip + itinerary planner         |
| `/about`              | `AboutView`             | What this app is                 |
| `*`                   | `NotFoundView`          | 404                              |

Every route except `/` is lazy-loaded into its own chunk.

## Project structure

```
src/
├── data/destinations.ts        # the destination catalog and guide content
├── types/travel.ts             # Destination, Trip, Currency, Locale types
├── i18n/
│   ├── config.ts               # currencies, locales and exchange rates
│   ├── index.ts                # useI18n(): t(), money(), month(), region(), tag()
│   └── messages.{en,es,fr,de,ja}.ts
├── stores/
│   ├── destinations.ts         # catalog, filters, wishlist, top pick of the month
│   ├── settings.ts             # language, currency, USD conversion
│   └── travel.ts               # trips, itineraries, budget math
├── assets/
│   ├── acme.css                # ACME design system: tokens, base and .acme-* classes
│   └── main.css                # app layer composed from those tokens
├── components/
│   ├── layout/                 # AppHeader, AppFooter, SettingsMenu
│   ├── destinations/           # DestinationCard, DestinationMedia, TopPick
│   └── travel/                 # TripForm, TripList, ItineraryPlanner
└── views/                      # one component per route
```

State lives in three Pinia setup stores, all persisted to `localStorage`. There is no backend —
clearing site data clears your trips, wishlist and preferences.

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

Covers the three stores, the i18n layer, the router, the `DestinationCard`, `TopPick`,
`TripForm` and `ItineraryPlanner` components, and the trips, wishlist and detail views. A
localisation suite mounts the whole app in all five languages across every route and fails if an
untranslated key reaches the DOM.

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
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
