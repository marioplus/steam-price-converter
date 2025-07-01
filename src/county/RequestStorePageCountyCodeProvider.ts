import {Http} from '../utils/Http'
import {StorePageCountyCodeProvider} from './StorePageCountyCodeProvider'

/**
 * 请求商店页面获取区域代码
 */
export class RequestStorePageCountyCodeProvider extends StorePageCountyCodeProvider {

    name(): string {
        return '请求商店页面'
    }

    match(): boolean {
        const href = window.location.href
        return !href.includes('store.steampowered.com') || href.includes('store.steampowered.com/wishlist')
    }

    async getStoreDocument(): Promise<Document> {
        const storeHtml = await Http.get(String, 'https://store.steampowered.com/') as string
        const parser = new DOMParser()
        return parser.parseFromString(storeHtml, 'text/html')
    }

}
