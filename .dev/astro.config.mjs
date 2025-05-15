import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

import TEIInlinerPlugin from '@recogito/plugin-tei-inliner';

export default defineConfig({
  integrations: [
    react(),
    TEIInlinerPlugin()
  ],
  devToolbar: {
    enabled: false
  },
  adapter: node({
    mode: 'standalone'
  })
});