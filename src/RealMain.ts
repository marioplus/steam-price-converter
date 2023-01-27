import {ConverterManager} from './converter/ConverterManager'
import {CountyCode2CountyInfo, CountyInfo} from './county/CountyInfo'
import {RateManager} from './rate/RateManager'
import './style/style.css'
import {CountyCodeGetterManager} from './county/CountyCodeGetterManager'
import {format} from './LogUtil'


export async function main(targetCounty: CountyInfo) {

    // 获取国家代码
    let countyCode: string = await CountyCodeGetterManager.instance.getCountyCode()
    if (targetCounty.code === countyCode) {
        console.info(format(`${targetCounty.name}无需转换`))
        return
    }

    // 获取货币代码
    const currCounty = CountyCode2CountyInfo.get(countyCode)
    if (!currCounty) {
        throw Error('获取货币代码失败')
    }
    console.info(format('获取区域对应信息：'), currCounty)

    // 获取汇率
    const rate = await RateManager.instance.getRate(currCounty, targetCounty)
    if (!rate) {
        throw Error('获取汇率失败')
    }
    console.info(format(`汇率 ${currCounty.currencyCode} -> ${targetCounty.currencyCode}：${rate}`))
    await convert(rate)
}

async function convert(rate: number) {
    const exchangerManager = ConverterManager.instance
    // 手动触发一次
    const elements = document.querySelectorAll(exchangerManager.getSelector())
    exchangerManager.convert(elements, rate)

    // 注册观察者
    const priceObserver = new MutationObserver(mutations => {
        mutations.forEach(async mutation => {
            const target = <HTMLElement>mutation.target
            const selector = exchangerManager.getSelector()
            const priceEls = target.querySelectorAll(selector)
            if (!priceEls || priceEls.length === 0) {
                return
            }
            exchangerManager.convert(priceEls, <number>rate)
        })
    })
    priceObserver.observe(document, {
        childList: true,
        subtree: true,
    })

}

