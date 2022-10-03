import 'reflect-metadata'
import {ExchangeRateManager} from './remote/ExchangeRateManager'
import {GM_addStyle} from 'vite-plugin-monkey/dist/client'
// import rate1 from './rate.json'

GM_addStyle(`
    .tab_item_discount {
      min-width:113px !important;
      width:unset;
    }
`)

const currencies = new Map([
    ['HK', 'HKD']
])

const priceSelectors: string[] = [
    // 首页
    '.discount_original_price',
    '.discount_final_price',
    // 头像旁边
    '#header_wallet_balance',
    // 列表页面
    '.col.search_price.discounted.responsive_secondrow strike',
]
const finalPriceSelectors = priceSelectors.reduce((prev, curr) => prev + ', ' + curr)

const priceObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        const target = <HTMLElement>mutation.target
        const priceEls = target.querySelectorAll(finalPriceSelectors)
        if (!priceEls || priceEls.length === 0) {
            return
        }
        priceEls.forEach(priceEl => {
            const content = priceEl.textContent
            if (content?.match(/\(/)) {
                return
            }
            if (!content || !content.match(/\d/)) {
                return
            }
            const split = content.split(/\s/)
            const currency = split[0].replaceAll(/\$/g, '').trim()
            const originalPrice = split[1].trim()
            let finalPrice = split[1].replaceAll(/\D/g, '')
            if (originalPrice.length > 2 && originalPrice.substring(originalPrice.length - 3, originalPrice.length - 2)) {
                finalPrice = finalPrice.substring(0, finalPrice.length - 2) + '.' + finalPrice.substring(finalPrice.length - 2)
            }
            const price = Number.parseFloat(finalPrice)
            ExchangeRateManager.instance.refreshRate()
                .then(res => {
                    const finalCurrency = currencies.get(currency) || currency
                    const rate = res.rates.get(finalCurrency)
                    if (!rate) {
                        console.log(`获取汇率失败：${currency}`)
                        return
                    }
                    const cnyPrice = Number.parseFloat((price / rate).toFixed(2))
                    console.log(`'${split[0]}' => '${split[1]}'`)
                    console.log(`${finalCurrency} => ${price}`)
                    console.log(`CNY => ${cnyPrice}`)
                    priceEl.textContent = `${content} (¥ ${cnyPrice})`
                })

        })
    })
})

priceObserver.observe(document, {
    childList: true,
    subtree: true,
})

