import {AbstractExchanger} from './AbstractExchanger'
import {ElementSnap} from './ExchangerManager'

export class HomePageExchanger extends AbstractExchanger {

    getCssSelectors(): string[] {
        return [
            // 首页
            '.discount_original_price',
            '.discount_final_price',
            // 头像旁边
            '#header_wallet_balance',
        ]
    }


    match(elementSnap: ElementSnap): boolean {
        if (!super.match(elementSnap)) {
            return false
        }

        const content = elementSnap.textContext
        if (!content) {
            return false
        }
        // 文本中有数字 eg: ARS$ 399,53
        return content.match(/\d/) !== null


    }

    doExchange(elementSnap: ElementSnap, rateProvider: (currency: string) => number): boolean {
        // 提取货币代码和货币量
        // @ts-ignore match 方法已经检查过了，不可能为 null
        const content: string = elementSnap.textContext.trim()
        const currency = this.getCurrency(content)
        const price = this.getPrice(content)
        const rate = rateProvider(currency)
        const cnyPrice = Number.parseFloat((price / rate).toFixed(2))

        elementSnap.element.textContent = `${content} (¥ ${cnyPrice})`
        return true
    }

    /**
     * 提取获取货币代码 eg: ARS$ 1.399,53
     * @param content 包含货币和价格的字符串
     */
    getCurrency(content: string): string {
        const matches = content.match(/\w+/)
        if (!matches) {
            throw Error('提取获取货币代码失败：content:' + content)
        }
        return matches[0]
    }

    /**
     * 提取获取价格 eg: ARS$ 1.399,53
     * @param content 包含货币和价格的字符串
     */
    getPrice(content: string) {
        const matches = content.match(/\d.+/)
        if (!matches) {
            throw Error('提取价格失败：content:' + content)
        }
        // 1.399,53
        let priceStr = matches[0]
            .replaceAll(/\D/g, '')
        // 139953
        let price = Number.parseInt(priceStr)
        // 小数点 1399.53
        if (content.match(/\D\d\d/)) {
            price = price / 100
        }
        return price
    }
}
