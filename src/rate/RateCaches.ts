import {JsonProperty, Serializable} from '../Serializable'

export class RateCache extends Serializable<RateCaches> {

    constructor(from: string, to: string, rate?: number, createdAt?: number) {
        super()
        this.from = from
        this.to = to
        this.createdAt = createdAt || 0
        this.rate = rate || 0
    }

    @JsonProperty()
    from: string

    @JsonProperty()
    to: string

    @JsonProperty()
    createdAt: number

    @JsonProperty()
    rate: number
}

export class RateCaches extends Serializable<RateCaches> {

    @JsonProperty({typeAs: Map})
    caches: Map<string, RateCache> = new Map<string, RateCache>()

    getCache(from: string, to: string): RateCache | undefined {
        return this.caches.get(this.buildCacheKey(from, to))
    }

    setCache(cache: RateCache) {
        this.caches.set(this.buildCacheKey(cache.from, cache.to), cache)
    }

    private buildCacheKey(from: string, to: string): string {
        return `${from}:${to}`
    }

}
