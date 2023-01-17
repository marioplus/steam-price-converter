import {Setting} from './Setting'
import {GM_getValue, GM_setValue, unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {STORAGE_KEY_SETTING} from '../constant/Constant'
import {CountyCode2County} from '../County'

export class SettingManager {
    public static instance: SettingManager = new SettingManager()
    setting: Setting

    private constructor() {
        this.setting = this.loadSetting()
        // @ts-ignore
        unsafeWindow.ScpSettingManager = this
    }

    private loadSetting(): Setting {
        const json = GM_getValue(STORAGE_KEY_SETTING, new Setting().toJsonString())
        const setting = new Setting().readJsonString(json)
        console.log(`读取设置`, setting)
        return setting
    }

    /**
     * 保存设置
     * @param setting  设置
     */
    public saveSetting(setting: Setting) {
        console.log(`保存设置`, setting)
        GM_setValue(STORAGE_KEY_SETTING, setting.toJsonString())
    }

    public setCountyCode(countyCode: string) {
        const county = CountyCode2County.get(countyCode)
        if (!county) {
            throw Error(`国家代码不存在：${countyCode}`)
        }
        this.setting.countyCode = countyCode
        this.saveSetting(this.setting)
    }

    public setCurrencySymbol(currencySymbol: string) {
        this.setting.currencySymbol = currencySymbol
        this.saveSetting(this.setting)
    }

    public setSymbolPositionFirst(symbolPositionFirst: boolean) {
        this.setting.symbolPositionFirst = symbolPositionFirst
        this.saveSetting(this.setting)
        console.log(this.setting.toJsonString())
    }

    public reset() {
        this.saveSetting(new Setting())
    }
}
