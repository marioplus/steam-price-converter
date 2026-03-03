// https://zh.wikipedia.org/wiki/ISO_4217
// https://zh.wikipedia.org/wiki/ISO_3166-1%E4%BA%8C%E4%BD%8D%E5%AD%97%E6%AF%8D%E4%BB%A3%E7%A0%81#%E6%AD%A3%E5%BC%8F%E5%88%86%E9%85%8D%E4%BB%A3%E7%A0%81
import countyObjs from './county-data.json'
import { Jsons } from '../utils/Jsons'

/**
 * 地区货币信息（货币 DNA）
 *
 * 每条记录完整描述一个地区的货币显示规则，用于价格识别与解析。
 */
export interface CountyInfo {
    /** 地区代码（ISO 3166-1 二位字母），如 'US'、'CN'、'JP' */
    code: string;
    /** 地区中文名称，如 '美国'、'中国' */
    name: string;
    /** 地区英文名称，如 'United States' */
    nameEn: string;
    /** 货币代码（ISO 4217），如 'USD'、'CNY'、'JPY' */
    currencyCode: string;
    /** 货币符号，如 '$'、'¥'、'€'、'NT$'、'руб' */
    symbol: string;
    /** 小数分隔符，如 '.'（美国）或 ','（德国）；无小数位的币种为 null */
    decimalSep: string | null;
    /** 千分位分隔符，如 ','（美国）、'.'（巴西）、' '（波兰）；无千分位为 null */
    thousandsSep: string | null;
    /** 小数精度，如 2（$1,234.56）或 0（¥1,235） */
    fractionDigits: number;
    /** 符号位置：'front' 前置（$100）或 'end' 后置（100€） */
    symbolPos: 'front' | 'end';
    /** 符号与数字之间的间隔，如 ' '（NT$ 100）或 ''（$100） */
    symbolGap: string;
}

export const countyInfos = Jsons.readJson(countyObjs, Array<CountyInfo>).sort((a, b) => a.name.localeCompare(b.name))
export const countyCode2Info = new Map<string, CountyInfo>(countyInfos.map(v => [v.code, v]))
