import {SettingManager} from './setting/SettingManager'
import {RateManager} from './rate/RateManager'

export class SpcManager {

    public static instance: SpcManager = new SpcManager()

    private constructor() {

    }

    public setCountyCode(code: string) {
        SettingManager.instance.setCountyCode(code)
    }

    public setCurrencySymbol(symbol: string) {
        SettingManager.instance.setCurrencySymbol(symbol)
    }

    public setCurrencySymbolBeforeValue(isCurrencySymbolBeforeValue: boolean) {
        SettingManager.instance.setCurrencySymbolBeforeValue(isCurrencySymbolBeforeValue)
    }

    public setRateCacheExpired(expired: number) {
        SettingManager.instance.setRateCacheExpired(expired)
    }

    public resetSetting() {
        SettingManager.instance.reset()
    }

    public clearCache() {
        RateManager.instance.clear()
    }

    public setUseCustomRate(isUseCustomRate: boolean) {
        SettingManager.instance.setUseCustomRate(isUseCustomRate)
    }

    public setCustomRate(customRate: number) {
        SettingManager.instance.setCustomRate(customRate)
    }
}
