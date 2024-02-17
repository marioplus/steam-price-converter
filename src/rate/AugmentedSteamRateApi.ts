import {IRateApi} from './IRateApi'
import {CountyInfo} from '../county/CountyInfo'
import {format} from '../LogUtil'
import {Http} from './Http'

export class AugmentedSteamRateApi implements IRateApi {

    getName(): string {
        return 'AugmentedSteamRateApi'
    }

    async getRate(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        console.info(format('通过 AugmentedSteam 获取汇率 %s(%s) -> %s(%s)...',
            currCounty.currencyCode,
            currCounty.name,
            targetCounty.currencyCode,
            targetCounty.name))
        const url = `https://api.augmentedsteam.com/rates/v1?to=${currCounty.currencyCode}`
        let rate: number | void | null = await Http.getAsJson(url)
            .then(res => {
                if (!res) {
                    return null
                }
                // @ts-ignore
                return res[targetCounty.currencyCode][currCounty.currencyCode]
            })
            .catch(err => console.log(format('通过 AugmentedSteam 获取汇率失败：%s', err)))
        if (rate) {
            return rate
        }
        throw new Error(`通过 ${this.getName()} 获取汇率失败。`)
    }

}
