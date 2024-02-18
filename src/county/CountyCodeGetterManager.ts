import {ICountyInfoGetter} from './ICountyInfoGetter'
import {CookieCountyInfoGetter} from './CookieCountyInfoGetter'
import {RequestStorePageCountyCodeGetter} from './RequestStorePageCountyCodeGetter'
import {StorePageCountyCodeGetter} from './StorePageCountyCodeGetter'
import {MarketPageCountyCodeGetter} from './MarketPageCountyCodeGetter'
import {Logger} from '../utils/LogUtils'


export class CountyCodeGetterManager implements ICountyInfoGetter {
    static readonly instance: CountyCodeGetterManager = new CountyCodeGetterManager()

    private readonly getters: ICountyInfoGetter[]

    private constructor() {
        this.getters = [
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
        Logger.info('获取区域代码...')
        let code: string | undefined
        for (let getter of this.getters) {
            if (getter.match()) {
                try {
                    code = await getter.getCountyCode()
                } catch (e) {
                    console.error(e)
                }
            }
            if (code) {
                return code
            }
        }
        Logger.error('获取区域代码...')
        throw new Error('获取区域代码失败。')
    }

}
