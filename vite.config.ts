import {defineConfig} from 'vite'
import monkey, {cdn} from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'steam价格转换',
                author: 'marioplus',
                description: 'steam商店中的价格转换为人民币',
                version: '1.0.3',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'https://github.com/marioplus/steam-price-converter',
                license: 'AGPL-3.0-or-later',
                match: [
                    'https://store.steampowered.com/*',
                    'https://steamcommunity.com/*'
                ],
                connect: [
                    'open.er-api.com',
                    'store.steampowered.com'
                ]
            },
            build: {
                externalGlobals: {
                    'reflect-metadata': cdn.jsdelivr('', 'Reflect.js')
                }
            },
        }),
    ],
})
