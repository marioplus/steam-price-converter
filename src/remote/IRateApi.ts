export interface IRateApi {
    /**
     * 获取汇率
     * Currency -> rate
     */
    getRates(): Promise<Map<string, number>>
}


