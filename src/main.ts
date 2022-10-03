import 'reflect-metadata'
import {GM_addStyle} from 'vite-plugin-monkey/dist/client'
import {ExchangerManager} from './exchanger/ExchangerManager'
// import rate1 from './rate.json'

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

const priceObserver = new MutationObserver(mutations => {
    mutations.forEach(async mutation => {
        const target = <HTMLElement>mutation.target
        const selector = ExchangerManager.instance.getSelector()
        const priceEls = target.querySelectorAll(selector)
        if (!priceEls || priceEls.length === 0) {
            return
        }
        await ExchangerManager.instance.doExchange(priceEls)
    })
})

priceObserver.observe(document, {
    childList: true,
    subtree: true,
})

