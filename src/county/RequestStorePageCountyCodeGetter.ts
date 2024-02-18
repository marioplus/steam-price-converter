import {ICountyInfoGetter} from './ICountyInfoGetter'
import {GM_xmlhttpRequest} from 'vite-plugin-monkey/dist/client'
import {Logger} from '../utils/LogUtils'

/**
 * 请求商店页面获取区域代码
 */
export class RequestStorePageCountyCodeGetter implements ICountyInfoGetter {

    match(): boolean {
        return !window.location.href.includes('store.steampowered.com')
    }

    async getCountyCode(): Promise<string> {
        Logger.info('通过 请求商店页面 获取区域代码...')
        let countyCode: string | undefined = undefined

        await new Promise<string>(resolve => GM_xmlhttpRequest({
            url: 'https://store.steampowered.com/',
            onload: response => resolve(response.responseText)
        }))
            .then(res => {
                const match = res.match(/(?<=GDynamicStore.Init\(.+')[A-Z][A-Z](?=',)/)
                if (match) {
                    countyCode = match[0]
                    Logger.info('通过 请求商店页面 获取区域代码成功：'+ countyCode)
                }
            })
        if (countyCode) {
            return countyCode
        }
        throw Error('通过 请求商店页面 获取区域代码失败。')
    }

}
