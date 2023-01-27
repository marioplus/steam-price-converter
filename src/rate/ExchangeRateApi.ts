import {IRateApi} from './IRateApi'
import {JsonAlias, JsonProperty, Serializable} from '../Serializable'
import {Http} from './Http'
import {CountyInfo} from '../county/CountyInfo'
import {format} from '../LogUtil'


export class RateRes extends Serializable<RateRes> {

    @JsonAlias('result')
    result?: string
    @JsonAlias('provider')
    provider?: string
    @JsonAlias('documentation')
    documentation?: string
    @JsonAlias('terms_of_use')
    termsOfUse?: string
    @JsonAlias('time_last_update_unix')
    timeLastUpdateUnix?: number
    @JsonAlias('time_last_update_utc')
    timeLastUpdateUtc?: string
    @JsonAlias('time_next_update_unix')
    timeNextUpdateUnix?: number
    @JsonAlias('time_next_update_utc')
    timeNextUpdateUtc?: string
    @JsonAlias('time_eol_unix')
    timeEolUnix?: number
    @JsonAlias('base_code')
    baseCode?: string
    @JsonProperty({
        alias: 'rates',
        typeAs: Map
    })
    rates?: Map<string, number>
}

export class ExchangeRateApi implements IRateApi {

    async getRate(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number> {
        console.info(format('通过 www.exchangerate-api.com 获取汇率'))
        console.debug(currCounty, targetCounty)
        const url = `https://open.er-api.com/v6/latest/${targetCounty.currencyCode}`
        let rate: number | undefined = await Http.get<RateRes>(url, RateRes)
            .then(res => {
                const rates = <Map<string, number>>res.rates
                return rates.get(currCounty.currencyCode)
            })
        if (rate) {
            return rate
        }
        throw new Error('')
    }
}
