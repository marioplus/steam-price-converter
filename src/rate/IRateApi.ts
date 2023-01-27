import {CountyInfo} from '../county/CountyInfo'

export interface IRateApi {
    /**
     * 获取汇率
     * Currency -> rate
     */
    getRate(currCounty: CountyInfo, targetCounty: CountyInfo): Promise<number>
}


