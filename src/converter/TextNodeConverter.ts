import {AbstractConverter} from './AbstractConverter'
import {ElementSnap} from './ConverterManager'
import {convertPriceContent} from './ConvertUtils'

type parseTextNodeFn = (element: Element) => ChildNode

export class TextNodeConverter extends AbstractConverter {

    // @ts-ignore
    targets: Map<string, parseTextNodeFn> = new Map<string, parseTextNodeFn>([
        // @ts-ignore
        ['.col.search_price.responsive_secondrow', el => el.firstChild.nextSibling.nextSibling.nextSibling],
        ['#header_wallet_balance', el => el.firstChild],
    ])

    getCssSelectors(): string[] {
        return [...this.targets.keys()]
    }

    convert(elementSnap: ElementSnap, rate: number): boolean {
        // 找到对应的元素
        // @ts-ignore
        const selector: string = elementSnap.selector
        this.targets.get(selector)

        // 拿到对应的 textNode
        const parseNodeFn: parseTextNodeFn | undefined = this.targets.get(selector)
        if (!parseNodeFn) {
            return false
        }
        const textNode = parseNodeFn(elementSnap.element)
        if (!textNode) {
            return false
        }

        // 转换
        const content = textNode.nodeValue
        if (!content) {
            return false
        }
        textNode.nodeValue = convertPriceContent(content, rate)
        return true
    }
}
