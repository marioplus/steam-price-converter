import {ICountyInfoProvider} from './ICountyInfoProvider'

/**
 * 购物车页面获取区域代码
 */
export class CartPageCountyCodeProvider implements ICountyInfoProvider {
    name(): string {
        return '购物车页面'
    }

    match(): boolean {
        return window.location.href.includes('store.steampowered.com/cart')
    }

    async getCountyCode(): Promise<string> {

        // @ts-ignore
        const loaderDataJson = window.SSR?.loaderData[1]
        if (loaderDataJson){
            // @ts-ignore
            return JSON.parse(loaderDataJson)?.countryOptions?.strAccountCountry
        }
        throw new Error(`无法从${this.name()}获取国家代码`)
    }

}
