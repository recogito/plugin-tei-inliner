import type { AstroIntegration } from 'astro';
import { Plugin, registerPlugin } from '@recogito/studio-sdk';

const TEIInlinerPlugin: Plugin = {

  name: 'TEI Inliner Plugin',

  module_name: '@recogito/plugin-tei-inliner',

  description: 'A plugin for exporting TEI annotations as inline markup.',

  author: 'Performant Software',

  homepage: 'https://www.performantsoftware.com/',

  extensions: [{

    name: 'export-inlined-tei-menu-item',

    component_name: 'ExportInlinedTEIMenuItem',

    extension_point: 'project:document-actions'
  }]

};

const plugin = (): AstroIntegration => ({
  name: "plugin-tei-inliner",
  hooks: {
    "astro:config:setup": ({ config, logger }) => {
      registerPlugin(TEIInlinerPlugin, config, logger);
    },
  },
});

export default plugin;