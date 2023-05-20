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
                description: 'steam商店中的价格转换为人民币',
                version: '2.1.0',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'https://github.com/marioplus/steam-price-converter',
                homepage: 'https://github.com/marioplus',
                license: 'GPL-3.0-or-later',
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
                    'reflect-metadata': [
                        'Reflect',
                        `data:application/javascript,${encodeURIComponent(
                            ';var Reflect=window.Reflect;'
                        )}`,
                        (version) =>
                            `https://cdn.jsdelivr.net/npm/reflect-metadata@${version}/Reflect.min.js`,
                    ],
                },
            },
        }),
    ]
})
