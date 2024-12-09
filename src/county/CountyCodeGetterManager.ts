import {ICountyInfoGetter} from './ICountyInfoGetter'
import {CookieCountyInfoGetter} from './CookieCountyInfoGetter'
import {RequestStorePageCountyCodeGetter} from './RequestStorePageCountyCodeGetter'
import {StorePageCountyCodeGetter} from './StorePageCountyCodeGetter'
import {MarketPageCountyCodeGetter} from './MarketPageCountyCodeGetter'
import {Logger} from '../utils/Logger'
import {UserConfigCountyInfoGetter} from "./UserConfigCountyInfoGetter";


export class CountyCodeGetterManager {

    static readonly instance: CountyCodeGetterManager = new CountyCodeGetterManager()

    private readonly getters: ICountyInfoGetter[]

    private constructor() {

        this.getters = [
            new UserConfigCountyInfoGetter(),
            new StorePageCountyCodeGetter(),
            new MarketPageCountyCodeGetter(),
            new RequestStorePageCountyCodeGetter(),
            new CookieCountyInfoGetter(),
        ]
    }

    match(): boolean {
        return true
    }

    async getCountyCode(): Promise<string> {
        Logger.info('尝试获取区域代码')

        for (let getter of this.getters) {
            if (!getter.match()) {
                continue
            }

            Logger.debug(`尝试通过[${getter.name()}]获取区域代码`)
            try {
                const countyCode = await getter.getCountyCode()
                Logger.info(`通过[${getter.name()}]获取区域代码成功`)
                return countyCode
            } catch (e) {
                Logger.error(`通过[${getter.name()}]获取区域代码失败`)
            }
        }
        throw new Error('所有获取区域代码策略都获取失败')
    }

}
