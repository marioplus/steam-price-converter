import {AbstractConverter} from './AbstractConverter'
import {ElementSnap} from './ConverterManager'

export class DefaultConverter extends AbstractConverter {

    getCssSelectors(): string[] {
        return [
            // 商店
            // 首页
            '.discount_original_price',
            '.discount_final_price',
            // 头像旁边
            '#header_wallet_balance',
            // 愿望单总价值
            '.esi-wishlist-stat > .num',
            // 新版卡片
            '.salepreviewwidgets_StoreOriginalPrice_1EKGZ',
            '.salepreviewwidgets_StoreSalePriceBox_Wh0L8',

            '.game_purchase_price.price',

            // 市场
            // 总余额
            '#marketWalletBalanceAmount',
            // 列表
            'span.normal_price[data-price]',
            'span.sale_price',
            // 求购、求售统计
            '.market_commodity_orders_header_promote:nth-child(even)',
            // 求购、求售列表
            '.market_commodity_orders_table td:nth-child(odd)',
            // 详情列表
            '.market_table_value > span',
            '.jqplot-highlighter-tooltip',
        ]
    }

    doExchange(elementSnap: ElementSnap, rate: number): boolean {
        // 提取货币代码和货币量
        // @ts-ignore match 方法已经检查过了，不可能为 null
        elementSnap.element.textContent = this.doExChange(elementSnap.textContext, rate)
        return true
    }
}
