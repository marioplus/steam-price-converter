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

    public isCurrencySymbolBeforeValue(isCurrencySymbolBeforeValue: boolean) {
        SettingManager.instance.isCurrencySymbolBeforeValue(isCurrencySymbolBeforeValue)
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
}
