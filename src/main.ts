import {main} from './RealMain'
import {CountyCode2CountyInfo} from './county/CountyInfo'
import {SettingManager} from './setting/SettingManager'
import {addCdnCss} from './utils/ElementUtils'
import mdui from 'mdui'
import {createApp} from 'vue'
import './style/style.less'
// @ts-ignore
import App from './App.vue'
import {GM_registerMenuCommand} from '$'
import {GM_setValue} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'

(async () => {
    initCdn()
    initApp()
    initMenu()
    await doConvert()
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

async function doConvert() {
    // 目标国家代码，可在此处替换
    const countyCode = SettingManager.instance.setting.countyCode
    const county = CountyCode2CountyInfo.get(countyCode)
    if (!county) {
        throw Error('获取转换后的国家信息失败，国家代码：' + countyCode)
    }
    await main(county)
}

function initMenu() {
    GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_CLOSE_MENU)
    GM_registerMenuCommand('设置', () => {
        GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU)
    })
}
