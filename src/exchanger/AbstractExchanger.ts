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

        const content = elementSnap.textContext

        if (!content) {
            return false
        }

        // 不处理人名币
        if (content.startsWith('¥')) {
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
            if (parent.querySelector(selector)) {
                return true
            }
        }
        return false
    }

    /**
     * 具体操作
     * @param elementSnap 选择器选择到的元素快照
     * @param rate 汇率
     * @return 处理结果
     */
    abstract doExchange(elementSnap: ElementSnap, rate: number): boolean

    /**
     * 具体操作,执行替换字符
     * @param originalContent 原始内容
     * @param rate 汇率
     * @return 替换后的内容
     * @return 处理结果
     */
    protected doExChange(originalContent: string, rate: number): string {
        const safeContent = originalContent.trim()
            .replaceAll(/\(.+$/g, '')
            .trim()
        const price = this.getPrice(safeContent)
        // console.log('safeContent', safeContent, 'currency', currency, 'price', price, 'rate', rate)
        const cnyPrice = Number.parseFloat((price / rate).toFixed(2))
        return `${safeContent}(¥${cnyPrice})`
    }

    /**
     * 替换之后的操作
     * @param elementSnap 选择器选择到的元素快照
     */
    afterExchange(elementSnap: ElementSnap): void {
        elementSnap.element.classList.add(exchangedClassName)
    }

    /**
     * 提取获取价格 eg: ARS$ 1.399,53 $1.2
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
