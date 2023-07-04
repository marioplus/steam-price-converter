import {JsonAlias, JsonProperty, Serializable} from '../Serializable'
import {IRateApi} from './IRateApi'
import {CountyInfo} from '../county/CountyInfo'
import {format} from '../LogUtil'
import {Http} from './Http'

export class AugmentedSteamRateResponse extends Serializable<AugmentedSteamRateResponse> {
    @JsonAlias()
    result?: string
    @JsonProperty({
        typeAs: Map,
        mapValue: true
    })
    data?: Map<string, Map<string, number>>
}

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
        const url = `https://api.augmentedsteam.com/v01/rates/?to=${currCounty.currencyCode}`
        let rate: number | void | null = await Http.get<AugmentedSteamRateResponse>(url, AugmentedSteamRateResponse)
            .then(res => {
                if ('success' !== res?.result) {
                    return null
                }
                return res.data?.get(targetCounty.currencyCode)?.get(currCounty.currencyCode)
            })
            .catch(err => console.log(format('通过 AugmentedSteam 获取汇率失败：%s', err)))
        if (rate) {
            return  rate
        }
        throw new Error(`通过 ${this.getName()} 获取汇率失败。`)
    }

}
