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

    doExchange(elementSnap: ElementSnap, rateProvider: (currency: string) => number): boolean {
        // 提取货币代码和货币量
        // @ts-ignore match 方法已经检查过了，不可能为 null
        const content: string = elementSnap.textContext.trim()
        const currency = super.getCurrency(content)
        const price = super.getPrice(content)
        const rate = rateProvider(currency)
        const cnyPrice = Number.parseFloat((price / rate).toFixed(2))

        elementSnap.element.textContent = `${content}(¥${cnyPrice})`
        return true
    }
}
