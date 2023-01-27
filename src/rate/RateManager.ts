import {IRateApi} from './IRateApi'
import {ExchangeRateApi} from './ExchangeRateApi'
import {GM_deleteValue, GM_getValue, GM_setValue, unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {CountyInfo} from '../county/CountyInfo'
import {format} from '../LogUtil'
import {RateCache, RateCaches} from './RateCaches'
import {DEFAULT_RATE_CACHE_EXPIRED, STORAGE_KEY_RATE_CACHES} from '../constant/Constant'

export class RateManager implements IRateApi {

    public static instance: RateManager = new RateManager()
    private readonly rateApis: IRateApi[]
    private readonly rateCaches: RateCaches

    private constructor() {
        this.rateApis = [
            new ExchangeRateApi()
        ]
        this.rateCaches = this.loadRateCache()

        // @ts-ignore
        unsafeWindow.RateManager = this
    }

    private async getRate4Remote(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        console.log(format('远程获取汇率...'))
        let rate: number | undefined
        for (let rateApi of this.rateApis) {
            rate = await rateApi.getRate(currCounty, targetCounty)
            if (rate) {
                return rate
            }
        }
        throw Error('远程获取汇率失败')
    }

    public async getRate(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        let cache = this.rateCaches.getCache(currCounty.code, targetCounty.code)
        // 过期需要重新获取
        const now = new Date().getTime()
        if (cache === undefined || cache.expiredAt < now) {
            // 两小时过期时间
            console.info(format(`本地缓存已过期`))
            cache = new RateCache(currCounty.code, targetCounty.code)
            cache.rate = await this.getRate4Remote(currCounty, targetCounty)
            cache.createdAt = new Date().getTime()
            cache.expiredAt = cache.createdAt + DEFAULT_RATE_CACHE_EXPIRED
            this.rateCaches.setCache(cache)
            this.saveRateCache()
        }
        return cache.rate
    }

    private loadRateCache(): RateCaches {
        const jsonString = GM_getValue(STORAGE_KEY_RATE_CACHES, '{}')
        const caches = new RateCaches()
        console.info(format(`读取汇率缓存`))
        return caches.readJsonString(jsonString)
    }

    private saveRateCache() {
        console.info(format('保存汇率缓存'), this.rateCaches)
        GM_setValue(STORAGE_KEY_RATE_CACHES, this.rateCaches.toJsonString())
    }

    public reset() {
        GM_deleteValue(STORAGE_KEY_RATE_CACHES)
    }

}

