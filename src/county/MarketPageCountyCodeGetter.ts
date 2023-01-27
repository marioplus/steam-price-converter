import {ICountyInfoGetter} from './ICountyInfoGetter'
import {format} from '../LogUtil'

/**
 * 市场页面获取区域代码
 */
export class MarketPageCountyCodeGetter implements ICountyInfoGetter {

    match(): boolean {
        return window.location.href.includes('steamcommunity.com')
    }

    getCountyCode(): Promise<string> {
        console.info(format('通过 市场页面 获取区域代码...'))
        // @ts-ignore
        const code: string | undefined = g_strCountryCode
        if (code) {
            return new Promise<string>(resolve => resolve(code))
        }
        throw Error(format('通过 市场页面 获取区域代码失败。'))
    }

}
