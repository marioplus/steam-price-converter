import {IRateApi} from './IRateApi'
import {ExchangeRateApi} from './ExchangeRateApi'
import {JsonAlias, JsonProperty, Serializable} from '../Serializable'
import {GM_getValue, GM_setValue} from 'vite-plugin-monkey/dist/client'

const RateCacheStorageKey = 'Storage:RateCache'

class RateCache extends Serializable<RateCache> {

    @JsonAlias('expiredAt')
    expiredAt: number = 0

    @JsonProperty({
        alias: 'rates',
        typeAs: Map
    })
    rates: Map<string, number> = new Map<string, number>()

    expired(): boolean {
        return this.expiredAt < new Date().getTime()
    }
}


export class ExchangeRateManager implements IRateApi {

    public static instance: ExchangeRateManager = new ExchangeRateManager()
    rateApis: Array<IRateApi> = new Array<IRateApi>()
    rateCache?: RateCache

    private constructor() {
        this.rateApis.push(new ExchangeRateApi())
    }

    getRates(): Promise<Map<string, number>> {
        return this.rateApis[0].getRates()
    }

    async refreshRate(): Promise<RateCache> {
        // 先从 storage 获取
        if (!this.rateCache) {
            this.rateCache = this.loadRateCache()
            return this.refreshRate()
        }
        // 过期需要重新获取
        if (this.rateCache.expired()) {

            // 两小时过期时间
            console.log('本地缓存已过期')
            this.rateCache.rates = await this.getRates()
            this.rateCache.expiredAt = new Date().getTime() + (1000 * 60 * 60)
            this.saveRateCache(this.rateCache)

        }
        return this.rateCache
    }

    private loadRateCache(): RateCache {
        console.log('读取本地汇率缓存')
        const jsonString = GM_getValue(RateCacheStorageKey, '{}')
        const cache = new RateCache()
        return cache.readJsonString(jsonString)
    }

    private saveRateCache(rateCache: RateCache) {
        console.log('保存本地汇率缓存')
        GM_setValue(RateCacheStorageKey, rateCache.toJsonString())
    }

}

