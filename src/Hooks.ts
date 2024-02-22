import {Logger} from './utils/LogUtils'
import {SettingManager} from './setting/SettingManager'
import {CountyCode2CountyInfo} from './county/CountyInfo'

export function doHook() {

    hookInventoryItemPrice()
}

// https://partner.steamgames.com/doc/store/pricing/currencies
const ECurrency = new Map([
    ['USD', 1],// 美元
    ['GBP', 2],// 英镑
    ['EUR', 3],// 欧元
    ['CHF', 4],// 瑞士法郎
    ['RUB', 5],// 俄罗斯卢布
    ['PLN', 6],// 波兰兹罗提
    ['BRL', 7],// 巴西雷亚尔
    ['JPY', 8],// 日元
    ['NOK', 9],// 挪威克朗
    ['IDR', 10],// 印度尼西亚卢比
    ['MYR', 11],// 马来西亚林吉特
    ['PHP', 12],// 菲律宾比索
    ['SGD', 13],// 新加坡元
    ['THB', 14],// 泰铢
    ['VND', 15],// 越南盾
    ['KRW', 16],// 韩元
    ['UAH', 18],// 乌克兰格里夫纳
    ['MXN', 19],// 墨西哥比索
    ['CAD', 20],// 加拿大元
    ['AUD', 21],// 澳大利亚元
    ['NZD', 22],// 新西兰元
    ['CNY', 23],//中国人民币（元）
    ['INR', 24],// 印度卢比
    ['CLP', 25],// 智利比索
    ['PEN', 26],// 秘鲁索尔
    ['COP', 27],// 哥伦比亚比索
    ['ZAR', 28],// 南非兰特
    ['HKD', 29],// 港元
    ['TWD', 30],// 新台币
    ['SAR', 31],// 沙特里亚尔
    ['AED', 32],// 阿联酋迪拉姆
    ['ILS', 35],// 以色列新谢克尔
    ['KZT', 37],// 哈萨克斯坦坚戈
    ['KWD', 38],// 科威特第纳尔
    ['QAR', 39],// 卡塔尔里亚尔
    ['CRC', 40],// 哥斯达黎加科朗
    ['UYU', 41],// 乌拉圭比索
])

/**
 * 库存物品市场价格
 */
function hookInventoryItemPrice() {

    const countyCode = SettingManager.instance.setting.countyCode
    const countyInfo = CountyCode2CountyInfo.get(countyCode)
    const walletCurrency = countyInfo?.currencyCode && ECurrency.get(countyInfo.currencyCode)

    //  @ts-ignore
    if (window.g_rgWalletInfo) {
        //  @ts-ignore
        window.g_rgWalletInfo['wallet_currency'] = 23
    }

    // {
    //     "type": "es_marketInfo",
    //     "information": {
    //         "view": 0,
    //         "sessionId": "b8ab52d00629a878995c6132",
    //         "marketAllowed": false,
    //         "country": "AR",
    //         "assetId": "34002987102",
    //         "contextId": 2,
    //         "globalId": 730,
    //         "walletCurrency": 1,
    //         "marketable": 1,
    //         "hashName": "Tec-9 | Army Mesh (Factory New)",
    //         "publisherFee": "0.10",
    //         "lowestListingPrice": 0.03,
    //         "restriction": false
    //     }
    // }
    type Message = {
        // es_${countyCode}
        type: string
        information: MarketInfo
    }

    type MarketInfo = {
        'view': number,
        'sessionId': string,
        'marketAllowed': boolean,
        'country': string,
        'assetId': string,
        'contextId': number,
        'globalId': number,
        // 货币
        'walletCurrency': number,
        'marketable': number,
        'hashName': string,
        'publisherFee': string,
        'lowestListingPrice': number,
        'restriction': boolean
    }

    let oldPostMessage = window.postMessage

    // @ts-ignore
    function hookPostMessage(msg: Message) {
        if (msg.type === 'es_marketInfo') {
            msg.information.walletCurrency = walletCurrency || msg.information.walletCurrency
        }
        // @ts-ignore
        return oldPostMessage.apply(this, arguments)
    }

    window.postMessage = hookPostMessage
    // @ts-ignore
    window.Messenger.postMessage = hookPostMessage
    Logger.debug('hooked postMessage')
}
