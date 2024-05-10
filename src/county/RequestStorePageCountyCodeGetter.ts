import {ICountyInfoGetter} from './ICountyInfoGetter'
import {Logger} from '../utils/LogUtils'
import {Http} from '../utils/Http'

/**
 * 请求商店页面获取区域代码
 */
export class RequestStorePageCountyCodeGetter implements ICountyInfoGetter {
    name(): string {
        return '请求商店页面'
    }


    match(): boolean {
        return !window.location.href.includes('store.steampowered.com')
    }

    async getCountyCode(): Promise<string> {
        return new Promise<string>(async resolve => {
            try {
                const storeHtml = await Http.get(String, 'https://store.steampowered.com/')
                const match = storeHtml.match(/(?<=GDynamicStore.Init\(.+')[A-Z][A-Z](?=',)/)
                if (match) {
                    resolve(match[0])
                }
            } catch (err: any) {
                Logger.error(err)
            }
        })
    }

}
