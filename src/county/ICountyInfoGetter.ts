export interface ICountyInfoGetter {

    /**
     * 是否匹配
     */
    match(): boolean

    /**
     * 获取区域代码
     */
    getCountyCode(): Promise<string>
}
