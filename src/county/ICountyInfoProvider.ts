export interface ICountyInfoProvider {

    /**
     * 是否匹配
     */
    match(): boolean

    /**
     * 名称
     */
    name(): string

    /**
     * 获取区域代码
     */
    getCountyCode(): Promise<string>
}
