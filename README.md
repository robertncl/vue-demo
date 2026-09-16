# Wanderlog — a Vue 3 travel planner

[![Build and Deploy](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml/badge.svg)](https://github.com/robertncl/vue-demo/actions/workflows/build.yaml)

Wanderlog is a self-contained travel app: browse a curated catalog of destinations, save the ones
you like, and turn them into dated trips with a costed, day-by-day itinerary that tracks spend
against your budget.

It replaces the default Vue scaffold entirely — the travel app is the only thing this project
serves, starting at `/`.

## Features

- **Explore** — a landing page with search, featured good-value destinations and your next departure.
- **Destinations** — twelve destinations filterable by search text, region, vibe and max daily budget.
- **Destination detail** — summary, highlights, seasonality, indicative costs and related places.
- **Wishlist** — star destinations; the list persists in `localStorage`.
- **Trip planner** — create dated trips, add activities per day, and watch the budget bar.
- Responsive layout, automatic light/dark theming, and a proper 404 route.

## Routes

| Path                  | View                    | Purpose                             |
| --------------------- | ----------------------- | ----------------------------------- |
| `/`                   | `HomeView`              | Hero, search, featured destinations |
| `/destinations`       | `DestinationsView`      | Filterable catalog                  |
| `/destinations/:slug` | `DestinationDetailView` | Single destination                  |
| `/wishlist`           | `WishlistView`          | Saved destinations                  |
| `/trips`              | `TripsView`             | Trip + itinerary planner            |
| `/about`              | `AboutView`             | What this app is                    |
| `*`                   | `NotFoundView`          | 404                                 |

Every route except `/` is lazy-loaded into its own chunk.

## Project structure

```
src/
├── data/destinations.ts        # the destination catalog
├── types/travel.ts             # Destination, Trip, Activity types
├── stores/
│   ├── destinations.ts         # catalog, filters, wishlist
│   └── travel.ts               # trips, itineraries, budget math
├── components/
│   ├── layout/                 # AppHeader, AppFooter
│   ├── destinations/           # DestinationCard
│   └── travel/                 # TripForm, TripList, ItineraryPlanner
└── views/                      # one component per route
```

State lives in two Pinia setup stores, both persisted to `localStorage`. There is no backend —
clearing site data clears your trips and wishlist.

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

Covers both stores, the router, and the `DestinationCard`, `TripForm` and `ItineraryPlanner`
components.

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
