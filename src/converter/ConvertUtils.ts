import {SettingManager} from '../setting/SettingManager'
import {Logger} from '../utils/Logger'

/**
 * 提取获取价格
 * 1                1
 * 1.0              1.0
 * 1.               1
 * ARS$ 1.399,53    1.399,53
 * 1.399,53€        1.399,53
 * @param content 包含货币和价格的字符串
 */
function parsePrice(content: string) {
    // 1.399,53
    let priceStr = content
        // 俄罗斯货币 两行的p 不一样 \u440 和 \u70
        .replace(/руб\./g, '')
        .replace(/pуб\./g, '')
        // 去掉空白符
        .replace(/\s/g, '')
        // 去掉货币符号
        .replace(/^[^0-9]+/, '')
        .replace(/[^0-9,.]+$/, '')
        // 去掉千分位
        .replace(/,(?=\d\d\d)/g, '')
    // 139953
    const numberStr = priceStr.replace(/\D/g, '')
    let price = Number.parseInt(numberStr) ?? 0
    // 小数点 1399.53
    if (priceStr.match(/\D/)) {
        price = price / 100.0
    }
    return price
}

/**
 * 根据汇率转换价格
 * @param price 价格
 * @param rate 汇率
 */
function convertPrice(price: number, rate: number) {
    return Number.parseFloat((price / rate).toFixed(2))
}

/**
 * 具体操作,执行替换字符
 * @param originalContent 原始内容
 * @param rate 汇率
 * @return 替换后的内容
 * @return 处理结果
 */
export function convertPriceContent(originalContent: string, rate: number): string {
    const safeContent = originalContent.trim()
        .replaceAll(/\(.+$/g, '')
        .trim()
    const price = parsePrice(safeContent)
    const convertedPrice = convertPrice(price, rate)
    const setting = SettingManager.instance.setting

    let finalContent = setting.currencySymbolBeforeValue
        ? `${safeContent}(${setting.currencySymbol}${convertedPrice})`
        : `${safeContent}(${convertedPrice}${setting.currencySymbol})`

    const message = `转换前文本：${safeContent}; 提取到的价格：${price}; 转换后的价格：${convertedPrice}; 转换后文本：${finalContent}`
    Logger.debug(message)

    return finalContent
}
