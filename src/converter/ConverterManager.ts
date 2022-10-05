import {AbstractConverter} from './AbstractConverter'
import {DefaultConverter} from './DefaultConverter'
import {SearchPageConverter} from './SearchPageConverter'

export const exchangedClassName = 'spe-exchanged'

export type ElementSnap = {
    element: Element,
    readonly textContext: string | null,
    readonly classList: DOMTokenList,
    readonly attributes: NamedNodeMap
}

export class ConverterManager {

    static instance: ConverterManager = new ConverterManager()

    private exchangers: AbstractConverter[]

    private constructor() {
        this.exchangers = [
            new DefaultConverter(),
            new SearchPageConverter()
        ]
    }

    getSelector(): string {
        return this.exchangers
            .map(exchanger => exchanger.getCssSelectors())
            .flat(1)
            .map(selector => `${selector}:not(.${exchangedClassName})`)
            .join(', ')
    }

    convert(elements: NodeListOf<Element>, rate: number) {
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
                    const exchanged = exchanger.convert(elementSnap, rate)

                    // 转换后续操作
                    if (exchanged) {
                        exchanger.afterConvert(elementSnap)
                    }
                })
        })
    }

}

