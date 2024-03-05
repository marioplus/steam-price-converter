export interface IRateApi {

    /**
     * 获取实现的名称
     */
    getName(): string

    /**
     * 获取汇率
     * Currency -> rate
     */
    getRate(): Promise<number>
}


