import { IRateApi } from './IRateApi'
import { RateCache, RateCaches } from './RateCaches'
import { STORAGE_KEY_RATE_CACHES } from '../constant/Constant'
import { Logger } from '../utils/Logger'
import { SpcContext } from '../SpcContext'
import { GmUtils } from '../utils/GmUtils'
import { Http } from '../utils/Http'

export class RateManager implements IRateApi {

    public static instance: RateManager = new RateManager()
    private memoryCache: RateCaches | null = null
    private pendingRequests = new Map<string, Promise<number>>()
    private isBroken = false // 全局熔断开关

    private constructor() {
    }

    getName(): string {
        return 'RateManager'
    }

    private async getRate4Remote(sourceCurrency: string, targetCurrency: string): Promise<number> {
        Logger.info(`[Rate] 远程获取汇率: ${sourceCurrency} -> ${targetCurrency}...`)
        let rate: number | undefined
        // 目前仅支持针对不同 source 获取汇率 (AugmentedSteam 限制)
        const url = `https://api.augmentedsteam.com/rates/v1?to=${sourceCurrency}`

        try {
            const res = await Http.get(Map<String, { [key in string]: number }>, url);
            rate = res.get(targetCurrency)?.[sourceCurrency];
        } catch (e) {
            Logger.error(`[Rate] 获取汇率对(${sourceCurrency} -> ${targetCurrency})失败`, e)
        }

        if (rate) return rate;
        throw Error(`所有汇率获取实现对币种对(${sourceCurrency} -> ${targetCurrency})均失败`)
    }

    public async getRate(sourceCurrencyCode?: string, targetCurrencyCode?: string): Promise<number> {
        if (this.isBroken) {
            throw new Error('[Rate] 汇率服务已熔断，停止请求');
        }

        const context = SpcContext.getContext()
        const from = sourceCurrencyCode || context.currentCountyInfo.currencyCode;
        const to = targetCurrencyCode || context.targetCountyInfo.currencyCode;
        const cacheKey = `${from}:${to}`;

        // 1. 优先使用自定义汇率
        if (context.setting.useCustomRate && !sourceCurrencyCode) {
            return context.setting.customRate
        }

        // 2. 请求去重：如果已有相同请求在进行中，直接复用
        const pending = this.pendingRequests.get(cacheKey);
        if (pending) return pending;

        const requestPromise = (async () => {
            try {
                // 3. 内存缓存懒加载
                if (!this.memoryCache) {
                    this.memoryCache = this.loadRateCache();
                    Logger.info(`[Rate] 内存缓存加载:`, this.memoryCache);
                }

                let cache = this.memoryCache.getCache(from, to);
                const now = Date.now();
                const expired = context.setting.rateCacheExpired;

                // 4. 判断是否需要刷新
                if (!cache || !cache.rate || now > cache.createdAt + expired) {
                    Logger.info(`[Rate] 缓存缺失或过期: ${from} -> ${to}`);
                    try {
                        const remoteRate = await this.getRate4Remote(from, to);
                        cache = new RateCache(from, to, remoteRate, now);
                        this.memoryCache.setCache(cache);
                        this.saveRateCache();
                    } catch (e) {
                        if (cache && cache.rate) {
                            Logger.warn(`[Rate] 远程刷新失败，回退至旧缓存: ${from} -> ${to}`);
                            return cache.rate;
                        }
                        // 彻底失败，触发熔断
                        this.isBroken = true;
                        Logger.error(`[Rate] 汇率获取彻底失败，触发全局熔断: ${from} -> ${to}`);
                        throw e;
                    }
                }
                return cache.rate;
            } finally {
                this.pendingRequests.delete(cacheKey);
            }
        })();

        this.pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    private loadRateCache(): RateCaches {
        const setting = SpcContext.getContext().setting
        if (setting.oldVersion !== setting.currVersion) {
            Logger.info(`脚本版本发生变化需要刷新汇率缓存`)
            this.clear()
            return new RateCaches()
        }

        Logger.info(`读取汇率缓存`)
        return GmUtils.getObjValue(RateCaches, STORAGE_KEY_RATE_CACHES, new RateCaches())
    }

    private saveRateCache() {
        if (!this.memoryCache) return;
        Logger.info('保存汇率缓存', this.memoryCache)
        GmUtils.setObjValue(STORAGE_KEY_RATE_CACHES, this.memoryCache)
    }

    public clear() {
        this.memoryCache = null;
        GmUtils.deleteValue(STORAGE_KEY_RATE_CACHES)
    }

}

