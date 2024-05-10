import {IRateApi} from './IRateApi'
import {RateCache, RateCaches} from './RateCaches'
import {STORAGE_KEY_RATE_CACHES} from '../constant/Constant'
import {AugmentedSteamRateApi} from './AugmentedSteamRateApi'
import {Logger} from '../utils/LogUtils'
import {SpcContext} from '../SpcContext'
import {GmUtils} from '../utils/GmUtils'

export class RateManager implements IRateApi {

    public static instance: RateManager = new RateManager()
    private readonly rateApis: IRateApi[]
    private rateCaches: RateCaches = new RateCaches()

    private constructor() {
        this.rateApis = [
            new AugmentedSteamRateApi()
        ]
    }

    getName(): string {
        return 'RateManager'
    }

    private async getRate4Remote(): Promise<number> {
        Logger.info('远程获取汇率...')
        let rate: number | undefined
        for (let rateApi of this.rateApis) {
            try {
                rate = await rateApi.getRate()
            } catch (e) {
                Logger.error(`使用实现(${rateApi.getName()})获取汇率失败`)
            }
            if (rate) {
                return rate
            }
        }
        throw Error('所有汇率获取实现获取汇率均失败')
    }

    public async getRate(): Promise<number> {
        const context = SpcContext.getContext()
        if (context.setting.useCustomRate) {
            Logger.info('使用自定义汇率')
            return context.setting.customRate
        }

        this.rateCaches = this.loadRateCache()
        let cache = this.rateCaches.getCache(context.currentCountyInfo.code, context.targetCountyInfo.code)
        // 过期需要重新获取
        const now = new Date().getTime()
        const expired = context.setting.rateCacheExpired
        if (!cache || !cache.rate || now > cache.createdAt + expired) {
            // 两小时过期时间
            Logger.info(`本地缓存已过期`)
            cache = new RateCache(context.currentCountyInfo.code, context.targetCountyInfo.code)
            cache.rate = await this.getRate4Remote()
            cache.createdAt = new Date().getTime()
            this.rateCaches.setCache(cache)
            this.saveRateCache()
        }
        return cache.rate
    }

    private loadRateCache(): RateCaches {
        const setting = SpcContext.getContext().setting
        if (setting.oldVersion !== setting.currVersion) {
            Logger.info(`脚本版本发生变化需要刷新汇率缓存`)
            this.clear()
            return new RateCaches()
        }

        Logger.info(`读取汇率缓存`)
        return GmUtils.getValue(RateCaches, STORAGE_KEY_RATE_CACHES, new RateCaches())
    }

    private saveRateCache() {
        Logger.info('保存汇率缓存', this.rateCaches)
        GmUtils.setValue(STORAGE_KEY_RATE_CACHES, this.rateCaches)
    }

    public clear() {
        GmUtils.deleteValue(STORAGE_KEY_RATE_CACHES)
    }

}

