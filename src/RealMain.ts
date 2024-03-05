import {ConverterManager} from './converter/ConverterManager'
import {RateManager} from './rate/RateManager'
import {Logger} from './utils/LogUtils'
import {Strings} from './utils/Strings'
import {SpcContext} from './SpcContext'

export async function main() {
    const context = SpcContext.getContext()

    if (context.currentCountyInfo.code === context.targetCountyInfo.code) {
        Logger.info(`${context.currentCountyInfo.name}无需转换`)
        return
    }

    // 获取汇率
    const rate = await RateManager.instance.getRate()
    if (!rate) {
        throw Error('获取汇率失败')
    }
    Logger.info(Strings.format(`汇率 %s -> %s：%s`, context.currentCountyInfo.currencyCode, context.targetCountyInfo.currencyCode, rate))
    await convert(rate)
}

async function convert(rate: number) {
    const exchangerManager = ConverterManager.instance
    // 手动触发一次
    const elements = document.querySelectorAll(exchangerManager.getSelector())
    exchangerManager.convert(elements, rate)

    // 注册观察者
    const selector = exchangerManager.getSelector()
    const priceObserver = new MutationObserver(mutations => {

        mutations.forEach(mutation => {
            const target = <HTMLElement>mutation.target
            let priceEls = target.querySelectorAll(selector)
            if (!priceEls || priceEls.length === 0) {
                return
            }
            exchangerManager.convert(priceEls, rate)
        })
    })
    priceObserver.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

