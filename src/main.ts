import 'reflect-metadata'
// mdui
import 'mdui/mdui.css'
import 'mdui'

import {main} from './RealMain'
import {countyCode2Info} from './county/CountyInfo'
import {SettingManager} from './setting/SettingManager'
import {createApp} from 'vue'
// @ts-ignore
import App from './App.vue'
import {GM_registerMenuCommand} from '$'
import {GM_setValue, unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'
import {SpcContext} from './SpcContext'
import {CountyCodeGetterManager} from './county/CountyCodeGetterManager'
import {SpcManager} from './SpcManager'
import {Logger} from './utils/LogUtils'


(async () => {
    await initContext()
    initApp()
    initMenu()
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

function initMenu() {
    GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_CLOSE_MENU)
    GM_registerMenuCommand('设置', () => {
        GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU)
    })
}

async function initContext() {
    const setting = SettingManager.instance.setting

    const targetCountyInfo = countyCode2Info.get(setting.countyCode)
    if (!targetCountyInfo) {
        throw Error('获取转换后的国家信息失败，国家代码：' + setting.countyCode)
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
