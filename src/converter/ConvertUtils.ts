import {SettingManager} from '../setting/SettingManager'
import {format} from '../LogUtil'

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
    const matches = content.match(/(?<=^\D*)\d+[\d,.]*?(?=\D*$)/)
    if (!matches) {
        throw Error('提取价格失败：content:' + content)
    }
    // 1.399,53
    let priceStr = matches[0]
        .replaceAll(/\D/g, '')
    // 139953
    let price = Number.parseInt(priceStr)
    // 小数点 1399.53
    if (matches[0].match(/\D\d\d$/)) {
        price = price / 100
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
    let finalContent
    if (setting.symbolPositionFirst) {
        finalContent = `${safeContent}(${setting.currencySymbol}${convertedPrice})`
    } else {
        finalContent = `${safeContent}(${convertedPrice}${setting.currencySymbol})`
    }

    console.debug(format('转换前文本：%s; 提取到的价格：%s; 转换后的价格：%s; 转换后文本：%s',
        safeContent,
        price,
        convertedPrice,
        finalContent))
    return finalContent
}
