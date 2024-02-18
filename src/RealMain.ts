import {ConverterManager} from './converter/ConverterManager'
import {CountyCode2CountyInfo, CountyInfo} from './county/CountyInfo'
import {RateManager} from './rate/RateManager'
import {CountyCodeGetterManager} from './county/CountyCodeGetterManager'
import {unsafeWindow} from 'vite-plugin-monkey/dist/client'
import {SpcManager} from './SpcManager'
import {Logger} from './utils/LogUtils'
import {Strings} from './utils/Strings'

export async function main(targetCounty: CountyInfo) {
    // @ts-ignore
    unsafeWindow.SpcManager = SpcManager.instance

    // 获取国家代码
    let countyCode: string = await CountyCodeGetterManager.instance.getCountyCode()
    if (targetCounty.code === countyCode) {
        Logger.info(`${targetCounty.name}无需转换`)
        return
    }

    // 获取货币代码
    const currCounty = CountyCode2CountyInfo.get(countyCode)
    if (!currCounty) {
        throw Error('获取货币代码失败')
    }
    Logger.info('获取区域对应信息：', currCounty)

    // 获取汇率
    const rate = await RateManager.instance.getRate(currCounty, targetCounty)
    if (!rate) {
        throw Error('获取汇率失败')
    }
    Logger.info(Strings.format(`汇率 %s -> %s：%s`, currCounty.currencyCode, targetCounty.currencyCode, rate))
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
            const priceEls = target.querySelectorAll(selector)
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

