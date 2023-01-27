import {ICountyInfoGetter} from './ICountyInfoGetter'
import {CookieCountyInfoGetter} from './CookieCountyInfoGetter'
import {RequestStorePageCountyCodeGetter} from './RequestStorePageCountyCodeGetter'
import {StorePageCountyCodeGetter} from './StorePageCountyCodeGetter'
import {format} from '../LogUtil'
import {MarketPageCountyCodeGetter} from './MarketPageCountyCodeGetter'


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
        console.info(format('获取区域代码...'))
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
        throw new Error(format('获取区域代码失败。'))
    }

}
