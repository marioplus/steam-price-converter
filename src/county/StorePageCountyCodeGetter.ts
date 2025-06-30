import {ICountyInfoGetter} from './ICountyInfoGetter'
import {Logger} from '../utils/Logger'

/**
 * 当前页面获取区域代码
 */
export class StorePageCountyCodeGetter implements ICountyInfoGetter {
    name(): string {
        return '商店页面'
    }


    match(): boolean {
        return window.location.href.includes('store.steampowered.com')
    }

    getCountyCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                // @ts-ignore
                let countyCode = GStoreItemData?.rgNavParams?.__page_default_obj?.countrycode
                if (countyCode) {
                    resolve(countyCode)
                }
            } catch (e: any) {
                Logger.warn('读取商店页面区域代码变量失败： ' + e.message)
            }

            // application_config 获取
            const dataConfig = document.querySelector('div#application_config')?.getAttribute('data-config')
            if (dataConfig) {
                const countyCode = JSON.parse(dataConfig)?.['COUNTRY']
                if (countyCode){
                    resolve(countyCode)
                }
            }

            document.querySelectorAll('script').forEach(scriptEl => {
                const scriptInnerText = scriptEl.innerText
                if (scriptInnerText.includes('$J( InitMiniprofileHovers );') || scriptInnerText.includes(`$J( InitMiniprofileHovers( 'https%3A%2F%2Fstore.steampowered.com%2F' ) );`)) {
                    const matcher = /(?<=')[A-Z]{2}(?!=')/g
                    const match = scriptInnerText.match(matcher)
                    if (match) {
                        const countyCode = match.toString()
                        resolve(countyCode)
                    }
                }
            })
            reject()
        })
    }
}
