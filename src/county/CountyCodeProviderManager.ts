import {ICountyInfoProvider} from './ICountyInfoProvider'
import {CookieCountyInfoProvider} from './CookieCountyInfoProvider'
import {RequestStorePageCountyCodeProvider} from './RequestStorePageCountyCodeProvider'
import {StorePageCountyCodeProvider} from './StorePageCountyCodeProvider'
import {MarketPageCountyCodeProvider} from './MarketPageCountyCodeProvider'
import {Logger} from '../utils/Logger'

export class CountyCodeProviderManager {

    static readonly instance: CountyCodeProviderManager = new CountyCodeProviderManager()

    private readonly providers: ICountyInfoProvider[]

    private constructor() {

        this.providers = [
            new StorePageCountyCodeProvider(),
            new MarketPageCountyCodeProvider(),
            new RequestStorePageCountyCodeProvider(),
            new CookieCountyInfoProvider(),
        ]
    }

    async getCountyCode(): Promise<string> {
        Logger.info('尝试获取区域代码')

        for (let provider of this.providers) {
            if (!provider.match()) {
                continue
            }

            Logger.debug(`尝试通过[${provider.name()}]获取区域代码`)
            try {
                const countyCode = await provider.getCountyCode()
                Logger.info(`通过[${provider.name()}]获取区域代码成功`)
                return countyCode
            } catch (e) {
                Logger.error(`通过[${provider.name()}]获取区域代码失败`)
            }
        }
        throw new Error('所有获取区域代码策略都获取失败')
    }

}
