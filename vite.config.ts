import {defineConfig} from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'steam价格转换',
                author: 'marioplus',
                description: 'steam商店中的价格转换为人名币',
                version: '1.0.0',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'marioplus/steam-price-exchanger',
                match: [
                    'https://store.steampowered.com/*',
                    'https://steamcommunity.com/*'
                ],
                connect: [
                    'open.er-api.com',
                    'store.steampowered.com'
                ]
            },
        }),
    ],
})
