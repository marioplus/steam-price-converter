import {AbstractExchanger} from './AbstractExchanger'
import {DefaultExchanger} from './DefaultExchanger'
import {SearchPageExchanger} from './SearchPageExchanger'

export const exchangedClassName = 'spe-exchanged'

export type ElementSnap = {
    element: Element,
    readonly textContext: string | null,
    readonly classList: DOMTokenList,
    readonly attributes: NamedNodeMap
}

export class ExchangerManager {

    static instance: ExchangerManager = new ExchangerManager()

    private exchangers: AbstractExchanger[]

    private constructor() {
        this.exchangers = [
            new DefaultExchanger(),
            new SearchPageExchanger()
        ]
    }

    getSelector(): string {
        return this.exchangers
            .map(exchanger => exchanger.getCssSelectors())
            .flat(1)
            .map(selector => `${selector}:not(.${exchangedClassName})`)
            .join(', ')
    }

    doExchange(elements: NodeListOf<Element>, rate: number) {
        if (!elements) {
            return
        }
        elements.forEach(element => {
            const elementSnap: ElementSnap = {
                element,
                textContext: element.textContent,
                classList: element.classList,
                attributes: element.attributes
            }

            this.exchangers
                .filter(exchanger => exchanger.match(elementSnap))
                .forEach(exchanger => {
                    const exchanged = exchanger.doExchange(elementSnap, rate)

                    // 转换后续操作
                    if (exchanged) {
                        exchanger.afterExchange(elementSnap)
                    }
                })
        })
    }

}

