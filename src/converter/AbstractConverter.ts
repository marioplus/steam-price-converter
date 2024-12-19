import {ElementSnap} from './ConverterManager'
import {Attrs} from '../constant/Constant'

export abstract class AbstractConverter {

    /**
     * 获取css选择器
     */
    abstract getCssSelectors(): string[]

    /**
     * 匹配到的元素，是否匹配这个 exchanger
     * @param elementSnap 选择器选择到的元素快照
     */
    match(elementSnap: ElementSnap): boolean {
        if (!elementSnap || !elementSnap.element) {
            return false
        }

        const content = elementSnap.textContext
        if (!content) {
            return false
        }

        // 文本中有数字 eg: ARS$ 399,53
        if (content.match(/\d/) === null) {
            return false
        }

        // 只有数字没有货币特征
        if (/^[,.\d\s]+$/.test(content)) {
            return false
        }

        // 该 exchanger 定义的选择器找到的
        const parent = elementSnap.element.parentElement
        if (!parent) {
            return false
        }
        for (const selector of this.getCssSelectors()) {
            const element = parent.querySelector(selector)
            if (element && element === elementSnap.element) {
                elementSnap.selector = selector
                return true
            }
        }
        // 防止重复转换
        const status = elementSnap.element.getAttribute(Attrs.STATUS_KEY)
        const converted = Attrs.STATUS_CONVERTED === status
        if (!converted) {
            return false
        }
        return false
    }

    /**
     * 具体操作
     * @param elementSnap 选择器选择到的元素快照
     * @param rate 汇率
     * @return 处理结果
     */
    abstract convert(elementSnap: ElementSnap, rate: number): boolean

    /**
     * 替换之后的操作
     * @param elementSnap 选择器选择到的元素快照
     */
    // @ts-ignore
    afterConvert(elementSnap: ElementSnap): void {
        // 标记被转换
        elementSnap.element.setAttribute(Attrs.STATUS_KEY, Attrs.STATUS_CONVERTED)
    }
}
