import {Setting} from './Setting'
import {GM_getValue, GM_setValue,} from 'vite-plugin-monkey/dist/client'
import {STORAGE_KEY_SETTING} from '../constant/Constant'
import {CountyCode2CountyInfo} from '../county/CountyInfo'
import {format} from '../LogUtil'
import {GM_info} from '$'

export class SettingManager {
    public static instance: SettingManager = new SettingManager()
    setting: Setting

    private constructor() {
        this.setting = this.loadSetting()
    }

    private loadSetting(): Setting {
        const json = GM_getValue(STORAGE_KEY_SETTING, new Setting().toJsonString())
        const setting = new Setting().readJsonString(json)
        setting.oldVersion = setting.currVersion
        setting.currVersion = GM_info.script.version

        if (setting.oldVersion !== setting.currVersion) {
            console.log(format(`版本更新：${setting.oldVersion} -> ${setting.currVersion}`))
        }

        console.log(format('读取设置'), setting)

        this.saveSetting(setting, false)
        return setting
    }

    /**
     * 保存设置
     * @param setting  设置
     * @param logger   是否打印日志
     */
    public saveSetting(setting: Setting, logger: boolean = true) {
        if (logger) {
            console.log(format('保存设置'), setting)
        }
        GM_setValue(STORAGE_KEY_SETTING, setting.toJsonString())
    }

    public setCountyCode(countyCode: string) {
        const county = CountyCode2CountyInfo.get(countyCode)
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

    public setCurrencySymbolBeforeValue(isCurrencySymbolBeforeValue: boolean) {
        this.setting.currencySymbolBeforeValue = isCurrencySymbolBeforeValue
        this.saveSetting(this.setting)
    }

    public reset() {
        this.saveSetting(new Setting())
    }

    public setRateCacheExpired(rateCacheExpired: number) {
        this.setting.rateCacheExpired = rateCacheExpired
        this.saveSetting(this.setting)
    }

    public setUseCustomRate(isUseCustomRate: boolean) {
        this.setting.useCustomRate = isUseCustomRate
        this.saveSetting(this.setting)
    }

    public setCustomRate(customRate: number) {
        this.setting.customRate = customRate
        this.saveSetting(this.setting)
    }
}
