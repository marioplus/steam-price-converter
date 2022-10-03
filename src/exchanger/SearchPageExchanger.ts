import {AbstractExchanger} from './AbstractExchanger'
import {ElementSnap} from './ExchangerManager'

export class SearchPageExchanger extends AbstractExchanger {

    getCssSelectors(): string[] {
        return [
            '.col.search_price.responsive_secondrow'
        ]
    }

    doExchange(elementSnap: ElementSnap, rateProvider: (currency: string) => number): boolean {
        const strike = elementSnap.element.querySelector('strike')
        // 原价
        if (strike && strike.textContent) {
            const content: string = strike.textContent.trim()
                .replaceAll(/\(.+$/g,'')
                .trim()
            const currency = super.getCurrency(content)
            const price = super.getPrice(content)
            const rate = rateProvider(currency)
            const cnyPrice = Number.parseFloat((price / rate).toFixed(2))
            strike.textContent = `${content}(¥${cnyPrice})`

            // 现价
            // @ts-ignore
            const textNode = elementSnap.element.firstChild.nextSibling.nextSibling.nextSibling
            if (textNode && textNode.nodeValue) {
                const content: string = textNode.nodeValue.trim()
                    .replaceAll(/\(.+$/g,'')
                    .trim()
                const currency = super.getCurrency(content)
                const price = super.getPrice(content)
                const rate = rateProvider(currency)
                const cnyPrice = Number.parseFloat((price / rate).toFixed(2))
                textNode.nodeValue = `${content}(¥${cnyPrice})`
            }
            return true
        }

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
