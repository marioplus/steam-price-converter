import {ICountyInfoGetter} from './ICountyInfoGetter'
import {CookieCountyInfoGetter} from './CookieCountyInfoGetter'
import {StorePageCountyCodeGetter} from './StorePageCountyCodeGetter'
import {CurrentPageCountyCodeGetter} from './CurrentPageCountyCodeGetter'
import {format} from '../LogUtil'


export class CountyCodeGetterManager implements ICountyInfoGetter {
    static readonly instance: CountyCodeGetterManager = new CountyCodeGetterManager()

    private readonly getters: ICountyInfoGetter[]

    private constructor() {
        this.getters = [
            new CurrentPageCountyCodeGetter(),
            new StorePageCountyCodeGetter(),
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
                await getter.getCountyCode().then(res => code = res)
            }
            if (code) {
                return code
            }
        }
        throw new Error(format('获取区域代码失败。'))
    }

}
