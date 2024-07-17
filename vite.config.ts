import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, {cdn, util} from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    // 所有以 mdui- 开头的标签名都是 mdui 组件
                    isCustomElement: (tag) => /^mdui-/.test(tag)
                }
            }
        }),
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'steam价格转换',
                author: 'marioplus',
                description: 'steam商店中的价格转换为人民币',
                version: '2.4.2',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'https://github.com/marioplus/steam-price-converter',
                homepage: 'https://github.com/marioplus',
                license: 'GPL-3.0-or-later',
                match: [
                    'https://store.steampowered.com/*',
                    'https://steamcommunity.com/*'
                ],
                connect: [
                    'api.augmentedsteam.com',
                    'store.steampowered.com',
                    'cdn.jsdelivr.net'
                ]
            },
            build: {
                externalGlobals: {
                    'reflect-metadata': cdn.jsdelivr('Reflect', 'Reflect.min.js').concat(util.dataUrl(`;var Reflect=window.Reflect;`)),
                    mdui: cdn.jsdelivr('mdui', 'mdui.global.min.js'),
                    vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
                },
                externalResource: {
                    'mdui/mdui.css': cdn.jsdelivr(),
                }
            },
        }),
    ]
})
