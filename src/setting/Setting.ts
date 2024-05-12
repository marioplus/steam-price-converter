import {Type} from 'class-transformer'
import {LogLabel} from '../utils/Logger'

export class Setting {
    /**
     * 目标国家代码，默认CN
     */
    countyCode: string = 'CN'

    /**
     * 目标货币符号，默认 ￥
     */
    currencySymbol: string = '￥'

    /**
     * 符号位置在首
     */
    currencySymbolBeforeValue: boolean = true

    /**
     * 汇率获取时间，默认1小时
     */
    rateCacheExpired: number = 1000 * 60 * 60

    /**
     * 使用自定义汇率
     */
    useCustomRate: boolean = false

    /**
     * 自定义汇率
     */
    customRate: number = 1

    /**
     * 前一个版本
     */
    oldVersion: string = '0.0.0'

    /**
     * 当前版本
     */
    currVersion: string = '0.0.0'

    /**
     * 日志级别
     */
    @Type(() => String)
    logLevel: LogLabel = 'info'
}
