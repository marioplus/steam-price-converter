import {IRateApi} from './IRateApi'
import {ExchangeRateApi} from './ExchangeRateApi'
import {JsonAlias, JsonProperty, Serializable} from '../Serializable'
import {GM_getValue, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {County} from '../County'

const RATE_CACHE_STORAGE_KEY = 'Storage:RateCache'

class RateCache extends Serializable<RateCache> {

    @JsonAlias('from')
    from: string = ''

    @JsonAlias('to')
    to: string = ''

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


export class RateManager implements IRateApi {

    public static instance: RateManager = new RateManager()
    rateApis: Array<IRateApi> = new Array<IRateApi>()
    // from:to
    rateCacheMap: Map<string, RateCache> = new Map<string, RateCache>()

    private constructor() {
        this.rateApis.push(new ExchangeRateApi())
    }

    getRates(currCounty: County, targetCounty: County): Promise<Map<string, number>> {
        return this.rateApis[0].getRates(currCounty, targetCounty)
    }

    async refreshRate(currCounty: County, targetCounty: County): Promise<RateCache> {
        // 先从 storage 获取
        let storageKey = this.calcStorageKey(currCounty, targetCounty)
        let cache = this.rateCacheMap.get(storageKey)
        if (this.rateCacheMap.size == 0) {
            const rateCache: RateCache = this.loadRateCache(currCounty, targetCounty)
            this.rateCacheMap.set(storageKey, rateCache)
            return this.refreshRate(currCounty, targetCounty)
        }
        // 过期需要重新获取
        if (cache == undefined || cache.expired()) {
            // 两小时过期时间
            console.info(`本地缓存已过期`)
            cache = new RateCache()
            cache.rates = await this.getRates(currCounty, targetCounty)
            cache.expiredAt = new Date().getTime() + (1000 * 60 * 60)
            this.rateCacheMap.set(storageKey, cache)
            this.saveRateCache(cache, currCounty, targetCounty)

        }
        return cache
    }

    private loadRateCache(currCounty: County, targetCounty: County): RateCache {
        console.info(`读取本地汇率缓存:${currCounty.currencyCode} -> ${targetCounty.currencyCode}`)
        const storageKey = this.calcStorageKey(currCounty, targetCounty)
        const jsonString = GM_getValue(storageKey, '{}')
        const cache = new RateCache()
        return cache.readJsonString(jsonString)
    }

    private saveRateCache(rateCache: RateCache, currCounty: County, targetCounty: County) {
        console.info(`保存本地汇率缓存:${currCounty.currencyCode} -> ${targetCounty.currencyCode}`)
        const storageKey = this.calcStorageKey(currCounty, targetCounty)
        GM_setValue(storageKey, rateCache.toJsonString())
    }

    private calcStorageKey(currCounty: County, targetCounty: County): string {
        return `${RATE_CACHE_STORAGE_KEY}:${currCounty.currencyCode}:${targetCounty.currencyCode}`
    }
}

