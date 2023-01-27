import {AbstractConverter} from './AbstractConverter'
import {ElementSnap} from './ConverterManager'
import {convertPriceContent} from './ConvertUtils'

export class ElementConverter extends AbstractConverter {

    getCssSelectors(): string[] {
        return [
            // 商店
            // 首页
            '.discount_original_price',
            '.discount_final_price',
            '.col.search_price.responsive_secondrow strike',
            // 头像旁边
            '#header_wallet_balance > span.tooltip',
            // 愿望单总价值
            '.esi-wishlist-stat > .num',
            // // 新版卡片
            '.salepreviewwidgets_StoreOriginalPrice_1EKGZ',
            '.salepreviewwidgets_StoreSalePriceBox_Wh0L8',
            // 分类查看游戏
            '.contenthubshared_OriginalPrice_3hBh3',
            '.contenthubshared_FinalPrice_F_tGv',
            '.salepreviewwidgets_StoreSalePriceBox_Wh0L8:not(.salepreviewwidgets_StoreSalePrepurchaseLabel_Wxeyn)',

            // 购物车
            '.cart_item_price.with_discount > .original_price',
            '.cart_item_price.with_discount > div.price:not(.original_price)',
            '#cart_estimated_total',
            // 购物车 复核
            '.checkout_review_item_price > .price',
            '#review_subtotal_value.price',
            '#review_total_value.price',
            '.cart_item_price > .price',

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

            // 消费记录
            'tr.wallet_table_row > td.wht_total',
            'tr.wallet_table_row > td.wht_wallet_change.wallet_column',
            'tr.wallet_table_row > td.wht_wallet_balance.wallet_column',
            // dlc
            '.game_area_dlc_row > .game_area_dlc_price',
        ]
    }

    convert(elementSnap: ElementSnap, rate: number): boolean {
        // 提取货币代码和货币量
        // @ts-ignore match 方法已经检查过了，不可能为 null
        elementSnap.element.textContent = convertPriceContent(elementSnap.textContext, rate)
        return true
    }
}
