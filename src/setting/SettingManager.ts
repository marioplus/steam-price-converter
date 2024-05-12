import {Setting} from './Setting'
import {STORAGE_KEY_SETTING} from '../constant/Constant'
import {countyCode2Info} from '../county/CountyInfo'
import {GM_info} from '$'
import {Logger} from '../utils/Logger'
import {Strings} from '../utils/Strings'
import {GmUtils} from '../utils/GmUtils'

export class SettingManager {
    public static instance: SettingManager = new SettingManager()
    setting: Setting

    private constructor() {
        this.setting = this.loadSetting()
    }

    private loadSetting(): Setting {
        const setting = GmUtils.getValue(Setting, STORAGE_KEY_SETTING, new Setting())
        setting.oldVersion = setting.currVersion
        setting.currVersion = GM_info.script.version

        if (setting.oldVersion === setting.currVersion) {
            Logger.info('读取设置', setting)
        } else {
            Logger.debug(Strings.format(`版本更新重置设置：%s -> %s`, setting.oldVersion, setting.currVersion))
            this.saveSetting(setting)
        }

        return setting
    }

    /**
     * 保存设置
     * @param setting  设置
     */
    public saveSetting(setting: Setting) {
        Logger.info('保存设置', setting)
        this.setting = setting
        GmUtils.setValue(STORAGE_KEY_SETTING, setting)
    }

    public setCountyCode(countyCode: string) {
        const county = countyCode2Info.get(countyCode)
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
