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
        // 未处理过
        if (elementSnap.element.classList.contains(exchangedClassName)) {
            return false
        }

        // 文本中有数字 eg: ARS$ 399,53
        const content = elementSnap.textContext
        if (!content) {
            return false
        }
        if (content.match(/\d/) === null) {
            return false
        }

        // 该 exchanger 定义的选择器找到的
        const parent = elementSnap.element.parentElement
        if (!parent) {
            return false
        }
        for (const selector of this.getCssSelectors()) {
            if (parent.querySelector(selector)) {
                return true
            }
        }
        return false
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

    /**
     * 提取获取货币代码 eg: ARS$ 1.399,53
     * @param content 包含货币和价格的字符串
     */
    getCurrency(content: string): string {
        const matches = content.match(/\w+/)
        if (!matches) {
            throw Error('提取获取货币代码失败：content:' + content)
        }
        return matches[0]
    }

    /**
     * 提取获取价格 eg: ARS$ 1.399,53
     * @param content 包含货币和价格的字符串
     */
    getPrice(content: string) {
        const matches = content.match(/\d.+/)
        if (!matches) {
            throw Error('提取价格失败：content:' + content)
        }
        // 1.399,53
        let priceStr = matches[0]
            .replaceAll(/\D/g, '')
        // 139953
        let price = Number.parseInt(priceStr)
        // 小数点 1399.53
        if (content.match(/\D\d\d/)) {
            price = price / 100
        }
        return price
    }
}
