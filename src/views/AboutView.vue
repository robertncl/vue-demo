<script setup lang="ts">
import { destinations } from '@/data/destinations'
</script>

<template>
  <main
    style="
      flex: 1;
      width: 100%;
      max-width: 768px;
      margin: 0 auto;
      padding: var(--acme-space-12) var(--acme-space-6) var(--acme-space-20);
    "
  >
    <p
      style="
        margin: 0;
        font-size: var(--acme-text-xs);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--acme-color-accent);
      "
    >
      About
    </p>
    <h1 style="margin: var(--acme-space-2) 0 0; font-size: var(--acme-text-4xl)">
      About Wanderlog
    </h1>
    <p
      style="
        margin: var(--acme-space-4) 0 0;
        font-size: var(--acme-text-lg);
        color: var(--acme-color-text-muted);
        text-wrap: pretty;
      "
    >
      A small travel planner: a catalog of {{ destinations.length }} destinations with real daily
      budgets, a shortlist you keep, and a day-by-day itinerary that tracks spend.
    </p>

    <section style="margin-top: var(--acme-space-10)">
      <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">What it does</h2>
      <div class="acme-card" style="padding: var(--acme-space-2) var(--acme-space-4)">
        <table class="acme-table">
          <tbody>
            <tr>
              <td style="width: 12rem; color: var(--acme-color-text-muted)">Catalog</td>
              <td>
                {{ destinations.length }} destinations with in-depth guides, filterable by region,
                vibe and daily budget.
              </td>
            </tr>
            <tr>
              <td style="color: var(--acme-color-text-muted)">This month</td>
              <td>A top pick ranked by season first, value second, with three runners-up.</td>
            </tr>
            <tr>
              <td style="color: var(--acme-color-text-muted)">Shortlist</td>
              <td>Saved destinations compared side by side on price and season.</td>
            </tr>
            <tr>
              <td style="color: var(--acme-color-text-muted)">Planner</td>
              <td>Dated trips with a costed, day-by-day itinerary and a budget bar.</td>
            </tr>
            <tr>
              <td style="color: var(--acme-color-text-muted)">Money</td>
              <td>Six currencies, converted from a USD base at fixed reference rates.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section style="margin-top: var(--acme-space-10)">
      <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">Your data</h2>
      <p style="margin: 0; color: var(--acme-color-text-muted); text-wrap: pretty">
        There is no backend. Trips, shortlist entries and your currency choice live in this
        browser's localStorage, so clearing site data clears your plans.
      </p>
    </section>

    <section style="margin-top: var(--acme-space-10)">
      <h2 style="margin: 0 0 var(--acme-space-4); font-size: var(--acme-text-2xl)">
        About the prices
      </h2>
      <p style="margin: 0; color: var(--acme-color-text-muted); text-wrap: pretty">
        Costs are indicative, stored in USD and converted at fixed reference rates. They are a
        planning guide, not a quote.
      </p>
    </section>
  </main>
</template>
