# TEI Inline Markup Exporter Plugin

A Recogito Studio plugin for exporting TEI annotations as inline markup.

This plugin enables export of annotations as embedded tags in your TEI source, providing more natural integration with downstream TEI workflows.

## Features

- Injects annotations with selected tags (currently `placeName` and `persName`) directly into the TEI markup.
- Lets users choose whether to inline only **Recogito annotations**, or also include **read-only standOff annotations** already present in the document.
- When exporting both Recogito and standOff annotations, Recogito annotations will override standOff ones at the same location.

💡 Tip: Combine this plugin with the [Recogito Revisions Plugin](https://github.com/recogito/plugin-revisions) to manually refine or override automatic NER annotations.

## Installation

1. **Change into your Recogito Client folder.** To install the plugin package, run:

```sh
npm install @recogito/plugin-tei-inliner
```

2. **Update your astro.config.mjs to include the plugin:**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

+ import TEIInlinePlugin from '@recogito/plugin-tei-inliner';

export default defineConfig({
  integrations: [
    react(),
+   TEIInlinePlugin()
  ],
  output: 'server',
  adapter: netlify(),
  vite: {
    ssr: {
      noExternal: ['clsx', '@phosphor-icons/*', '@radix-ui/*']
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  }
});
```

3. **Restart the Recogito Client.**