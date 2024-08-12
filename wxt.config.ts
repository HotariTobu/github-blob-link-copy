import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: '{da00797e-b515-4dca-8e36-2df5fb92a235}',
      },
    },
  },
})
