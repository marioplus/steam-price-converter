import {ICountyInfoGetter} from './ICountyInfoGetter'
import {Http} from '../utils/Http'
import {unsafeWindow} from 'vite-plugin-monkey/dist/client'

export class UserConfigCountyInfoGetter implements ICountyInfoGetter {

    async getCountyCode(): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {

            // @ts-ignore
            const code = unsafeWindow.userConfig
                // @ts-ignore
                ? unsafeWindow.userConfig?.country_code
                : await this.getCountyCodeForDev()
            if (code) {
                resolve(code)
            } else {
                reject()
            }
        })
    }

    match(): boolean {
        return true
    }

    name(): string {
        return 'window.UserConfig'
    }

    async getCountyCodeForDev() {
        // @ts-ignore
        const html = await Http.get(String, window.location.href)
        const match = html.match(/,"country_code":"([A-Z]{2})"/)
        if (match) {
            return match[1]
        }
        return undefined
    }

}
