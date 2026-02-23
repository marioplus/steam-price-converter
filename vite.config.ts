import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        svgLoader(),
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'steam价格转换',
                author: 'marioplus',
                description: 'steam商店中的价格转换为人民币',
                version: '2.6.1',
                icon: 'https://www.google.com/s2/favicons?sz=64&domain=store.steampowered.com',
                namespace: 'https://github.com/marioplus/steam-price-converter',
                homepage: 'https://github.com/marioplus',
                license: 'GPL-3.0-or-later',
                match: [
                    'https://store.steampowered.com/*',
                    'https://steamcommunity.com/*',
                    'https://checkout.steampowered.com/checkout/*',
                ],
                connect: [
                    'api.augmentedsteam.com',
                    'store.steampowered.com',
                    'cdn.jsdelivr.net'
                ]
            },
            build: {
                externalGlobals: {
                    vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
                },
            },
        }),
    ],
    build: {
        assetsInlineLimit: 0,
    }
})
