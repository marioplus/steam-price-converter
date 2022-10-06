import {AbstractConverter} from './AbstractConverter'
import {DefaultConverter} from './DefaultConverter'
import {SearchPageConverter} from './SearchPageConverter'
import log from 'loglevel'

export type ElementSnap = {
    element: Element,
    readonly textContext: string | null,
    readonly classList: DOMTokenList,
    readonly attributes: NamedNodeMap
}

export class ConverterManager {

    static instance: ConverterManager = new ConverterManager()

    private converters: AbstractConverter[]

    private constructor() {
        this.converters = [
            new DefaultConverter(),
            new SearchPageConverter()
        ]
    }

    getSelector(): string {
        return this.converters
            .map(exchanger => exchanger.getCssSelectors())
            .flat(1)
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

            this.converters
                .filter(converter => converter.match(elementSnap))
                .forEach(converter => {
                    try {
                        const exchanged = converter.convert(elementSnap, rate)
                        // 转换后续操作
                        if (exchanged) {
                            converter.afterConvert(elementSnap)
                        }
                    } catch (e) {
                        log.error('转换失败请将下列内容反馈给开发者，右键 > 复制(copy) > 复制元素(copy element)')
                        log.error('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓')
                        log.error(element)
                        log.error('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑')
                    }
                })
        })
    }

}

