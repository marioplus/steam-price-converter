import {IRateApi} from './IRateApi'
import {JsonAlias, JsonProperty, Serializable} from '../Serializable'
import {Http} from './Http'
import log from 'loglevel'


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

    async getRates(): Promise<Map<string, number>> {
        log.info('通过 www.exchangerate-api.com 获取汇率')
        let rates: Map<string, number> = new Map<string, number>()
        await Http.get<RateRes>('https://open.er-api.com/v6/latest/CNY', RateRes)
            .then(res => rates = <Map<string, number>>res.rates)
        return rates
    }
}
