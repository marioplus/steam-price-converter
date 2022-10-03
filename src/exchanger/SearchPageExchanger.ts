import {AbstractExchanger} from './AbstractExchanger'
import {ElementSnap} from './ExchangerManager'

export class SearchPageExchanger extends AbstractExchanger {

    getCssSelectors(): string[] {
        return [
            '.col.search_price.responsive_secondrow'
        ]
    }

    doExchange(elementSnap: ElementSnap, rate: number): boolean {
        const strike = elementSnap.element.querySelector('strike')
        // 原价
        if (strike && strike.textContent) {
            strike.textContent = this.doExChange(strike.textContent, rate)

            // 现价
            // @ts-ignore
            const textNode = elementSnap.element.firstChild.nextSibling.nextSibling.nextSibling
            if (textNode && textNode.nodeValue) {
                textNode.nodeValue = this.doExChange(textNode.nodeValue, rate)
            }
            return true
        }

        // @ts-ignore match 方法已经检查过了，不可能为 null
        elementSnap.element.textContent = this.doExChange(elementSnap.textContext, rateProvider)

        return true
    }

}
