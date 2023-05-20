import {JsonProperty, Serializable} from '../Serializable'

export class Setting extends Serializable<Setting> {
    /**
     * 目标国家代码，默认CN
     */
    @JsonProperty()
    countyCode: string = 'CN'

    /**
     * 目标货币符号，默认 ￥
     */
    @JsonProperty()
    currencySymbol: string = '￥'

    /**
     * 符号位置在首
     */
    @JsonProperty()
    currencySymbolBeforeValue: boolean = true

    @JsonProperty()
    rateCacheExpired: number = 1000 * 60 * 60

    /**
     * 使用自定义汇率
     */
    @JsonProperty()
    useCustomRate: boolean = false

    /**
     * 自定义汇率
     */
    @JsonProperty()
    customRate: number = 1
}
