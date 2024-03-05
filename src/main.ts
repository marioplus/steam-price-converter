import {main} from './RealMain'
import {CountyCode2CountyInfo} from './county/CountyInfo'
import {SettingManager} from './setting/SettingManager'
import {addCdnCss} from './utils/ElementUtils'
import {createApp} from 'vue'
import './style/style.less'
// @ts-ignore
import App from './App.vue'
import {GM_registerMenuCommand} from '$'
import {GM_setValue, unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'
import mdui from 'mdui'
import {SpcContext} from './SpcContext'
import {CountyCodeGetterManager} from './county/CountyCodeGetterManager'
import {SpcManager} from './SpcManager'
import {Logger} from './utils/LogUtils'

(async () => {
    await initContext()
    // 非市场有白屏的bug没有菜单
    if (window.location.href.match('store.steampowered.com')) {
        initCdn()
        initApp()
        initMenu()
    }
    await main()
    // doHook()
})()

function initCdn() {
    addCdnCss([
        'https://cdn.jsdelivr.net/npm/mdui@1.0.2/dist/css/mdui.min.css',
        'https://cdn.jsdelivr.net/npm/ionicons@4.6.4-1/dist/css/ionicons.min.css',
    ])
    // addCdnScript(['https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.js'], 'module')
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
    mdui.mutation()
}

function initMenu() {
    GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_CLOSE_MENU)
    GM_registerMenuCommand('设置', () => {
        GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU)
    })
}

async function initContext() {
    const setting = SettingManager.instance.setting
    Logger.info('设置：', setting)

    const targetCountyInfo = CountyCode2CountyInfo.get(setting.countyCode)
    if (!targetCountyInfo) {
        throw Error('获取转换后的国家信息失败，国家代码：' + setting.countyCode)
    }
    Logger.info('目标区域：', targetCountyInfo)

    const currCountyCode = await CountyCodeGetterManager.instance.getCountyCode()
    const currCountInfo = CountyCode2CountyInfo.get(currCountyCode)
    if (!currCountyCode) {
        throw Error('缺少当前国家的信息映射：county: ' + currCountyCode)
    }
    Logger.info('当前区域：', currCountInfo)

    // @ts-ignore
    unsafeWindow.SpcManager = SpcManager.instance
    // @ts-ignore
    unsafeWindow.spcContext = new SpcContext(setting, targetCountyInfo, currCountInfo)
}
