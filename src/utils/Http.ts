import { GM_xmlhttpRequest, GmXmlhttpRequestOption } from '$'
import { ClassConstructor, Jsons } from './Jsons'

export class Http {

    static get<T>(cls: ClassConstructor<T>, url: string, details?: GmXmlhttpRequestOption<'text'>): Promise<T> {
        if (!details) {
            details = { url }
        }
        details.method = 'GET'
        return this.request<T>(cls, details)
    }

    static post<T>(url: string, cls: ClassConstructor<T>, details?: GmXmlhttpRequestOption<'text'>): Promise<T> {
        if (!details) {
            details = { url }
        }
        details.method = 'POST'
        return this.request<T>(cls, details)
    }

    private static request<T>(cls: ClassConstructor<T>, details: GmXmlhttpRequestOption<'text'>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            details.onload = (response: any) => {
                if (cls.name === String.name) {
                    resolve(response.response as T)
                } else {
                    const json = JSON.parse(response.response)
                    // @ts-ignore
                    resolve(Jsons.readJson(json, cls))
                }
            }
            details.onerror = (error: any) => reject(error)
            GM_xmlhttpRequest(details)
        })
    }

}
