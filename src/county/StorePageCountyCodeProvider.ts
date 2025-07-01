import {ICountyInfoProvider} from './ICountyInfoProvider'
import {Logger} from '../utils/Logger'

/**
 * 当前页面获取区域代码
 */
export class StorePageCountyCodeProvider implements ICountyInfoProvider {
    name(): string {
        return '商店页面'
    }


    match(): boolean {
        return window.location.href.includes('store.steampowered.com')
    }

    async getStoreDocument(): Promise<Document> {
        return document
    }

    async getCountyCode(): Promise<string> {

        const storeDom = await this.getStoreDocument()
        try {
            // @ts-ignore
            let countyCode = storeDom?.GStoreItemData?.rgNavParams?.__page_default_obj?.countrycode
            if (countyCode) {
                return countyCode
            }
        } catch (e: any) {
            Logger.warn('读取商店页面区域代码变量失败： ' + e.message)
        }

        // application_config 获取
        const dataConfig = storeDom.querySelector('div#application_config')?.getAttribute('data-config')
        if (dataConfig) {
            const countyCode = JSON.parse(dataConfig)?.['COUNTRY']
            if (countyCode) {
                return countyCode
            }
        }

        const matcher = /(?<="countrycode":")[A-Z]{2}(?!=")/g
        const scripts = storeDom.querySelectorAll('script')
        for (let scriptText in scripts) {
            const flag = scriptText.includes(`("countrycode":")HK(")`)
            if (flag) {
                const match = scriptText.match(matcher)
                if (match) {
                    return match.toString()
                }
            }
        }

        throw new Error('无法从商店页面获取国家代码')
    }

}
