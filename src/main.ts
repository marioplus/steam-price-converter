import 'reflect-metadata'
import {GM_addStyle, GM_xmlhttpRequest} from 'vite-plugin-monkey/dist/client'
import {ExchangerManager} from './exchanger/ExchangerManager'
import {counties} from './County'
import {ExchangeRateManager} from './remote/ExchangeRateManager'

GM_addStyle(`
    .tab_item_discount {
      min-width: 113px !important;
      width: unset;
    }
    .discount_final_price {
      display: inline-block !important;
    }
    
    /*商店搜索列表*/
    .search_result_row
    .col.search_price {
      width: 175px;
    }
    .search_result_row
    .col.search_name {
      width: 200px;
    }
    
    /*市场列表*/
    .market_listing_their_price {
      width: 160px;
    }
`)

// 获取国家代码
let countyCode: string = await getCountyCode()
if (!countyCode || countyCode.length === 0) {
    throw Error('获取国家代码失败！')
}

console.log('countyCode', countyCode)

if (countyCode === 'CN') {
    console.log('人名币无需转换')
} else {
    await doExchange()
}

async function getCountyCode(): Promise<string> {
    let countyCode: string | null = null
    // 商店页面直接抓取
    if (window.location.href.includes('store.steampowered.com')) {
        document.querySelectorAll('script').forEach(scriptEl => {
            if (scriptEl.innerText.includes('$J( InitMiniprofileHovers );')) {
                countyCode = scriptEl.innerText.trim()
                    .replaceAll(/[\n\t\s ]/g, '')
                    .split(';')
                    .filter(str => str.startsWith('GDynamicStore.Init'))[0]
                    .split(',')[16]
                    .replaceAll(/'/g, '')
                    .trim()
            }
        })
        if (countyCode) {
            return countyCode
        }
        throw Error('获取国家代码失败')
    }

    // 非商店页面请求商店首页抓取
    await new Promise<string>(resolve => GM_xmlhttpRequest({
        url: 'https://store.steampowered.com/',
        onload: response => resolve(response.responseText)
    }))
        .then(res => {
            const match = res.match(/(?<=GDynamicStore.Init\(.+')[A-Z][A-Z](?=',)/)
            if (!match || match.length <= 0) {
                throw Error('获取国家代码失败')
            }
            countyCode = match[0]
        })

    if (countyCode) {
        return countyCode
    }

    throw Error('获取国家代码失败')
}

async function doExchange() {
    // 获取货币代码
    const county = counties.get(countyCode)
    if (!county) {
        throw Error('获取货币代码失败')
    }
    console.log('获取货币代码', county)

    // 获取汇率
    let rate: number | undefined
    await ExchangeRateManager.instance.refreshRate()
        .then(resRate => rate = resRate.rates.get(county.currencyCode))

    if (!rate) {
        throw Error('获取汇率失败')
    } else {
        console.log('rate', rate)
    }

    const exchangerManager = ExchangerManager.instance
    // 手动触发一次
    const elements = document.querySelectorAll(exchangerManager.getSelector())
    exchangerManager.doExchange(elements, rate)

    // 注册观察者
    const priceObserver = new MutationObserver(mutations => {
        mutations.forEach(async mutation => {
            const target = <HTMLElement>mutation.target
            const selector = exchangerManager.getSelector()
            const priceEls = target.querySelectorAll(selector)
            if (!priceEls || priceEls.length === 0) {
                return
            }
            await exchangerManager.doExchange(priceEls, <number>rate)
        })
    })
    priceObserver.observe(document, {
        childList: true,
        subtree: true,
    })

}

