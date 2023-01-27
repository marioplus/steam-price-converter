import {ICountyInfoGetter} from './ICountyInfoGetter'
import {format} from '../LogUtil'

/**
 * 当前页面获取区域代码
 */
export class StorePageCountyCodeGetter implements ICountyInfoGetter {

    match(): boolean {
        return window.location.href.includes('store.steampowered.com')
    }

    getCountyCode(): Promise<string> {
        console.info(format('通过 商店页面 获取区域代码...'))
        return new Promise<string>(resolve => {
            document.querySelectorAll('script').forEach(scriptEl => {
                if (scriptEl.innerText.includes('$J( InitMiniprofileHovers );')) {
                    const matcher = /(?<=')[A-Z]{2}(?!=')/g
                    const match = scriptEl.innerText.match(matcher)
                    if (match) {
                        const countyCode = match.toString()
                        console.info(format('通过 商店页面 获取区域代码成功：' + countyCode))
                        resolve(countyCode)
                    }
                }
            })
            throw Error(format('通过 商店页面 获取区域代码失败。'))
        })
    }

}