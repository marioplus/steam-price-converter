// mdui
import 'mdui/mdui.css'
import 'mdui'
import './style/home.less'
import './style/search.less'
import './style/market.less'

import {main} from './RealMain'
import {countyCode2Info} from './county/CountyInfo'
import {SettingManager} from './setting/SettingManager'
import {createApp} from 'vue'
// @ts-ignore
import App from './App.vue'
import {unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {SpcContext} from './SpcContext'
import {CountyCodeGetterManager} from './county/CountyCodeGetterManager'
import {SpcManager} from './SpcManager'
import {Logger, setLogLevel} from './utils/Logger'
import {GmUtils} from './utils/GmUtils'
import {IM_MENU_ISSUES, IM_MENU_SETTING} from './constant/Constant'

(async () => {
    console.log('Body is ready!')
    await initContext()
    initApp()
    registerMenu()
    await main()
})()

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

    const currCountyCode = await CountyCodeGetterManager.instance.getCountyCode()
    const currCountInfo = countyCode2Info.get(currCountyCode)
    if (!currCountyCode) {
        throw Error('缺少当前国家的信息映射：county: ' + currCountyCode)
    }
    Logger.info('当前区域：', currCountInfo)

    // @ts-ignore
    unsafeWindow.SpcManager = SpcManager.instance
    // @ts-ignore
    unsafeWindow.spcContext = new SpcContext(setting, targetCountyInfo, currCountInfo)
}
