import {JsonAlias, Serializable} from '../Serializable'

export class Setting extends Serializable<Setting> {
    /**
     * 目标国家代码，默认CN
     */
    @JsonAlias('countyCode')
    countyCode: string = 'CN'

    /**
     * 目标货币符号，默认 ￥
     */
    @JsonAlias('currencySymbol')
    currencySymbol: string = '￥'

    /**
     * 符号位置在首
     */
    @JsonAlias('symbolPositionFirst')
    symbolPositionFirst: boolean = true
}
