export class RateCache {

    constructor(from: string, to: string, rate?: number, createdAt?: number) {
        this.from = from
        this.to = to
        this.createdAt = createdAt || 0
        this.rate = rate || 0
    }

    from: string

    to: string

    createdAt: number

    rate: number
}

export class RateCaches {

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
