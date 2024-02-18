import {ICountyInfoGetter} from './ICountyInfoGetter'
import {GM_cookie} from 'vite-plugin-monkey/dist/client'
import {Logger} from '../utils/LogUtils'

/**
 * 从 cookie 中获取区域代码
 */
export class CookieCountyInfoGetter implements ICountyInfoGetter {

    match(): boolean {
        return true
    }

    async getCountyCode(): Promise<string> {
        Logger.info('通过 cookie 获取区域代码...')
        let code: string | undefined
        await new Promise<string>(resolve => GM_cookie.list({name: 'steamCountry'}, cookies => {
            if (cookies && cookies.length > 0) {
                const match = cookies[0].value.match(/^[a-zA-Z][a-zA-Z]/)
                if (match) {
                    code = match[0]
                    resolve(code)
                }
            }
        }))
            .then(res => code = res)
        if (code) {
            Logger.info('通过 cookie 获取区域代码成功：' + code)
            return code
        }
        throw Error('通过 cookie 获取区域代码失败。')
    }

}
