import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    // Headless runs occasionally load a blank page: the browser aborts the
    // app's module requests a few ms into navigation, so no app code runs. The
    // preview server served 6,000 of 6,000 of the same parallel requests when
    // hit directly, so this is the Cypress browser/proxy layer, not the app. A
    // retry starts a fresh page load; a real app failure still fails every try.
    retries: { runMode: 2, openMode: 0 },
  },
})
