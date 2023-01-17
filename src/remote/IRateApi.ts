import {County} from '../County'

export interface IRateApi {
    /**
     * 获取汇率
     * Currency -> rate
     */
    getRates(currCounty: County, targetCounty: County): Promise<Map<string, number>>
}


