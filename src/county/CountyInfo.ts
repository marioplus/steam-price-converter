// https://zh.wikipedia.org/wiki/ISO_4217
// https://zh.wikipedia.org/wiki/ISO_3166-1%E4%BA%8C%E4%BD%8D%E5%AD%97%E6%AF%8D%E4%BB%A3%E7%A0%81#%E6%AD%A3%E5%BC%8F%E5%88%86%E9%85%8D%E4%BB%A3%E7%A0%81
import {Http} from '../utils/Http'
import {GM_info} from '$'

export class CountyInfo {
    code: string
    name: string
    nameEn: string
    currencyCode: string

    constructor(code: string, name: string, nameEn: string, currencyCode: string) {
        this.code = code
        this.name = name
        this.nameEn = nameEn
        this.currencyCode = currencyCode
    }
}

const url = `https://cdn.jsdelivr.net/gh/marioplus/steam-price-converter@v${GM_info.script.version}/src/county/countyCurrencyCodes.json`
export const countyInfos = await Http.get(Array<CountyInfo>, url)
export const countyCode2Info = new Map<string, CountyInfo>(countyInfos.map(v => [v.code, v]))
