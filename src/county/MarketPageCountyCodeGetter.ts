import {ICountyInfoGetter} from './ICountyInfoGetter'
import {Logger} from '../utils/Logger'

/**
 * 市场页面获取区域代码
 */
export class MarketPageCountyCodeGetter implements ICountyInfoGetter {
    name(): string {
        return '市场页面'
    }


    match(): boolean {
        return window.location.href.includes('steamcommunity.com')
    }

    getCountyCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                // @ts-ignore
                const code: string | undefined = g_strCountryCode
                if (code) return resolve(code)
            } catch (err: any) {
                Logger.error(err)
            }
            reject()
        })
    }

}
