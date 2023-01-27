import {AbstractConverter} from './AbstractConverter'
import {ElementSnap} from './ConverterManager'
import {convertPriceContent} from './ConvertUtils'

type parseTextNodeFn = (element: Element) => ChildNode

export class TextNodeConverter extends AbstractConverter {

    // @ts-ignore
    parseFirstChildTextNodeFn: parseTextNodeFn = el => el.firstChild

    // @ts-ignore
    targets: Map<string, parseTextNodeFn[]> = new Map<string, parseTextNodeFn[]>([
        ['.col.search_price.responsive_secondrow',
            [
                // @ts-ignore
                el => el.firstChild.nextSibling.nextSibling.nextSibling,
                this.parseFirstChildTextNodeFn,
            ],
        ],
        ['#header_wallet_balance', [this.parseFirstChildTextNodeFn]],
        // iframe
        ['.game_purchase_price.price', [this.parseFirstChildTextNodeFn]],
        // 低于xxx 分类标题
        ['.home_page_content_title', [this.parseFirstChildTextNodeFn]],
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
        const parseNodeFns: parseTextNodeFn[] | undefined = this.targets.get(selector)
        if (!parseNodeFns) {
            return false
        }

        const textNode = this.safeParseNode(selector, elementSnap.element, parseNodeFns)
        if (!textNode) {
            return false
        }

        // 转换
        const content = textNode.nodeValue
        if (!content || content.trim().length === 0) {
            return false
        }
        textNode.nodeValue = convertPriceContent(content, rate)
        return true
    }

    safeParseNode(selector: string, el: Element, fns: parseTextNodeFn[]): ChildNode | null {
        for (let fn of fns) {
            try {
                const node = fn(el)
                if (node.nodeName === '#text' && node.nodeValue && node.nodeValue.length > 0) {
                    return node
                }
            } catch (e) {
                console.debug('获取文本节点失败，但不确定该节点是否一定会出现。selector：' + selector)
            }
        }
        return null
    }
}
