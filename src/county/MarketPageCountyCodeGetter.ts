import {ICountyInfoGetter} from './ICountyInfoGetter'
import {Logger} from '../utils/LogUtils'

/**
 * 市场页面获取区域代码
 */
export class MarketPageCountyCodeGetter implements ICountyInfoGetter {

    match(): boolean {
        return window.location.href.includes('steamcommunity.com')
    }

    getCountyCode(): Promise<string> {
        Logger.info('通过 市场页面 获取区域代码...')
        // @ts-ignore
        const code: string | undefined = g_strCountryCode
        if (code) {
            return new Promise<string>(resolve => resolve(code))
        }
        Logger.error('通过 市场页面 获取区域代码失败。')
        throw Error('通过 市场页面 获取区域代码失败。')
    }

}
