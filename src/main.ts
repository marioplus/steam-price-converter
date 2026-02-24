import './style/home.scss'
import './style/search.scss'
import './style/market.scss'
import './style/style.scss'

import { countyCode2Info } from './county/CountyInfo'
import { SettingManager } from './setting/SettingManager'
import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue'
import { unsafeWindow } from 'vite-plugin-monkey/dist/client'
import { SpcContext } from './SpcContext'
import { CountyCodeProviderManager } from './county/CountyCodeProviderManager'
import { SpcManager } from './SpcManager'
import { Logger, setLogLevel } from './utils/Logger'
import { GmUtils } from './utils/GmUtils'
import { IM_MENU_ISSUES, IM_MENU_SETTING } from './constant/Constant'
import { ConverterManager } from './converter/ConverterManager'

(async () => {
    await initContext()
    initApp()
    registerMenu()
    await start()
})()

async function start() {
    const context = SpcContext.getContext()

    // 市场页面禁用逻辑
    if (context.setting.disableOnMarket && window.location.href === 'https://steamcommunity.com/market/') {
        Logger.info('已开启市场首页禁用，跳过转换')
        return
    }

    if (context.currentCountyInfo.code === context.targetCountyInfo.code) {
        Logger.info(`${context.currentCountyInfo.name}无需转换`)
        return
    }

    Logger.info(` 核心启动：目标：${context.targetCountyInfo.name}`)
    await convert()
}

async function convert() {
    const exchangerManager = ConverterManager.instance
    // 异步触发首次转换 (不再传递 rate，由处理器内聚处理)
    const elements = document.querySelectorAll(exchangerManager.getSelector())
    await exchangerManager.convert(elements)

    // 注册观察者
    const selector = exchangerManager.getSelector()
    const priceObserver = new MutationObserver(async (mutations) => {
        const uniqueTargets = new Set<Element>();

        mutations.forEach(mutation => {
            const target = <HTMLElement>mutation.target
            const priceEls = target.querySelectorAll(selector)
            priceEls.forEach(el => uniqueTargets.add(el));
        })

        if (uniqueTargets.size > 0) {
            // @ts-ignore
            await exchangerManager.convert(uniqueTargets);
        }
    })

    priceObserver.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

function initApp() {
    createApp(App).mount(
        (() => {
            const app = document.createElement('div')
            app.setAttribute('id', 'spc-menu')
            document.body.append(app)
            return app
        })(),
    )
}

function registerMenu() {
    GmUtils.registerMenuCommand(IM_MENU_SETTING)
    GmUtils.registerMenuCommand(IM_MENU_ISSUES, () => GmUtils.openInTab('https://github.com/marioplus/steam-price-converter'))
}

async function initContext() {
    const setting = SettingManager.instance.setting
    setLogLevel(setting.logLevel)

    let targetCountyInfo = countyCode2Info.get(setting.countyCode)
    if (!targetCountyInfo) {
        Logger.warn(`获取转换后的国家(${setting.countyCode})信息失败，默认为美国：` + setting.countyCode)
        targetCountyInfo = countyCode2Info.get('US')
    }
    Logger.info('目标区域：', targetCountyInfo)

    const currCountyCode = await CountyCodeProviderManager.instance.getCountyCode()
    if (currCountyCode) {
        Logger.info('区域代码：', currCountyCode)
    }
    let currCountInfo = countyCode2Info.get(currCountyCode)
    if (!currCountInfo) {
        Logger.warn('缺少当前国家的信息映射：county: ' + currCountyCode + ', 默认为美国')
        currCountInfo = countyCode2Info.get("US")
    }
    Logger.info('当前区域：', currCountInfo)

    // @ts-ignore
    unsafeWindow.SpcManager = SpcManager.instance
    // @ts-ignore
    unsafeWindow.spcContext = new SpcContext(setting, targetCountyInfo, currCountInfo)
}
