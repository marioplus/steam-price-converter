import {ICountyInfoGetter} from './ICountyInfoGetter'
import {GM_cookie} from '$'

/**
 * 从 cookie 中获取区域代码
 */
export class CookieCountyInfoGetter implements ICountyInfoGetter {
    name(): string {
        return 'cookie'
    }

    match(): boolean {
        return true
    }

    async getCountyCode(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const cookies = await GM_cookie.list({name: 'steamCountry'})
            if (cookies && cookies.length > 0) {
                const match = cookies[0].value.match(/^[a-zA-Z][a-zA-Z]/)
                if (match) {
                    resolve(match[0])
                }
            }
            reject()
        })
    }

}
