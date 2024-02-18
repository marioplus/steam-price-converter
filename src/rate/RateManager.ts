import {IRateApi} from './IRateApi'
import {GM_deleteValue, GM_getValue, GM_setValue,} from 'vite-plugin-monkey/dist/client'
import {CountyInfo} from '../county/CountyInfo'
import {RateCache, RateCaches} from './RateCaches'
import {STORAGE_KEY_RATE_CACHES} from '../constant/Constant'
import {SettingManager} from '../setting/SettingManager'
import {AugmentedSteamRateApi} from './AugmentedSteamRateApi'
import {Logger} from '../utils/LogUtils'

export class RateManager implements IRateApi {

    public static instance: RateManager = new RateManager()
    private readonly rateApis: IRateApi[]
    private readonly rateCaches: RateCaches

    private constructor() {
        this.rateApis = [
            new AugmentedSteamRateApi()
        ]
        this.rateCaches = this.loadRateCache()
    }

    getName(): string {
        return 'RateManager'
    }

    private async getRate4Remote(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        Logger.info('远程获取汇率...')
        let rate: number | undefined
        for (let rateApi of this.rateApis) {
            try {
                rate = await rateApi.getRate(currCounty, targetCounty)
            } catch (e) {
                Logger.error(`使用实现(${rateApi.getName()})获取汇率失败`)
            }
            if (rate) {
                return rate
            }
        }
        throw Error('所有汇率获取实现获取汇率均失败')
    }

    public async getRate(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        const setting = SettingManager.instance.setting
        if (setting.useCustomRate) {
            Logger.info('使用自定义汇率')
            return setting.customRate
        }

        let cache = this.rateCaches.getCache(currCounty.code, targetCounty.code)
        // 过期需要重新获取
        const now = new Date().getTime()
        const expired = setting.rateCacheExpired
        if (!cache || !cache.rate || now > cache.createdAt + expired) {
            // 两小时过期时间
            Logger.info(`本地缓存已过期`)
            cache = new RateCache(currCounty.code, targetCounty.code)
            cache.rate = await this.getRate4Remote(currCounty, targetCounty)
            cache.createdAt = new Date().getTime()
            this.rateCaches.setCache(cache)
            this.saveRateCache()
        }
        return cache.rate
    }

    private loadRateCache(): RateCaches {
        const caches = new RateCaches()

        const setting = SettingManager.instance.setting
        if (setting.oldVersion !== setting.currVersion) {
            Logger.info(`脚本版本发生变化需要刷新汇率缓存`)
            this.clear()
            return caches.readJsonString('{}')
        }

        const jsonString = GM_getValue(STORAGE_KEY_RATE_CACHES, '{}')
        Logger.info(`读取汇率缓存`)
        return caches.readJsonString(jsonString)
    }

    private saveRateCache() {
        Logger.info('保存汇率缓存', this.rateCaches)
        GM_setValue(STORAGE_KEY_RATE_CACHES, this.rateCaches.toJsonString())
    }

    public clear() {
        GM_deleteValue(STORAGE_KEY_RATE_CACHES)
    }

}

