import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    root : '.',
    srcDir: './src',
    publicDir: './public',
    outDir: './dist',
    cacheDir: './node_modules/.astro',
    redirects: {
        '/': '/index.html'
    },
    site: 'https://www.plugrapid.com',
    compressHTML: true,
    base: '/docs',
    trailingSlash: "never",
    scopedStyleStrategy: 'attribute',
    output: 'server',
    adapter: node({
        mode: "standalone"
    })

});