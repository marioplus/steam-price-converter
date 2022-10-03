import {ElementSnap, exchangedClassName} from './ExchangerManager'

export abstract class AbstractExchanger {

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
        return !elementSnap.element.classList.contains(exchangedClassName)

    }

    /**
     * 具体操作
     * @param elementSnap 选择器选择到的元素快照
     * @param rateProvider 使用汇率获取汇率的提供者
     * @return 处理结果
     */
    abstract doExchange(elementSnap: ElementSnap, rateProvider: (currency: string) => number): boolean

    /**
     * 替换之后的操作
     * @param elementSnap 选择器选择到的元素快照
     */
    afterExchange(elementSnap: ElementSnap): void {
        elementSnap.element.classList.add(exchangedClassName)
    }
}
