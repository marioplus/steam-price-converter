import {GM_cookie, GM_xmlhttpRequest} from 'vite-plugin-monkey/dist/client'
import {ConverterManager} from './converter/ConverterManager'
import {counties} from './County'
import {ExchangeRateManager} from './remote/ExchangeRateManager'
import './stype.css'


export async function main() {
    // 获取国家代码
    let countyCode: string = await getCountyCode()
    if (!countyCode || countyCode.length === 0) {
        throw Error('获取国家代码失败！')
    }
    console.log('成功获取到国家代码：', countyCode)
    if (countyCode === 'CN') {
        console.log('人民币无需转换')
        return
    }

    await convert(countyCode)
}

async function getCountyCode(): Promise<string> {
    return self == top ? getCountyCodeNotInIframe() : getCountyCodeInIframe()
}

async function getCountyCodeInIframe(): Promise<string> {
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
    }

    // iframe 尝试从 cookie中获取
    const iframeGetPromise = new Promise<string | null>(resolve => GM_cookie.list({name: 'steamCountry'}, cookies => {
        if (cookies && cookies.length > 0) {
            const match = cookies[0].value.match(/^[a-zA-Z][a-zA-Z]/)
            if (match) {
                resolve(match[0])
            }
        }
        resolve(null)
    }))
    countyCode = await iframeGetPromise
    if (countyCode) {
        console.log('通过 cookie 获取国家代码 : ' + countyCode)
        return countyCode
    }
    throw Error('获取国家代码失败')
}

async function getCountyCodeNotInIframe(): Promise<string> {
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

async function convert(countyCode: string) {
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
            await exchangerManager.convert(priceEls, <number>rate)
        })
    })
    priceObserver.observe(document, {
        childList: true,
        subtree: true,
    })

}

