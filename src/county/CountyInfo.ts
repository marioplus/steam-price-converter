// https://zh.wikipedia.org/wiki/ISO_4217
// https://zh.wikipedia.org/wiki/ISO_3166-1%E4%BA%8C%E4%BD%8D%E5%AD%97%E6%AF%8D%E4%BB%A3%E7%A0%81#%E6%AD%A3%E5%BC%8F%E5%88%86%E9%85%8D%E4%BB%A3%E7%A0%81
import countyObjs from './county-data.json'
import {Jsons} from '../utils/Jsons'

export interface CountyInfo {
    code: string
    name: string
    nameEn: string
    currencyCode: string
}

export const countyInfos = Jsons.readJson(countyObjs, Array<CountyInfo>).sort((a, b) => a.name.localeCompare(b.name))
export const countyCode2Info = new Map<string, CountyInfo>(countyInfos.map(v => [v.code, v]))
