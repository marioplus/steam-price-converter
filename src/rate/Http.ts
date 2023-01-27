import {GM_xmlhttpRequest} from 'vite-plugin-monkey/dist/client'
import {XhrRequest} from '$'
import {Serializable} from '../Serializable'

export class Http {

    static get<T extends Serializable<T>>(url: string, respType: Function, details?: XhrRequest): Promise<T> {
        if (!details) {
            details = {url}
        }
        details.method = 'GET'
        return this.request<T>(details, respType)
    }

    static post<T extends Serializable<T>>(url: string, respType: Function, details?: XhrRequest): Promise<T> {
        if (!details) {
            details = {url}
        }
        details.method = 'POST'
        return this.request<T>(details, respType)
    }

    private static parseResponse<T extends Serializable<T>>(response: any, respType: Function): T {
        const data = JSON.parse(response.response)
        // @ts-ignore
        const res = <T>new respType()
        return res.readJson(data)
    }

    private static request<T extends Serializable<T>>(details: XhrRequest, respType: Function): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            details.onload = response => resolve(this.parseResponse<T>(response, respType))
            details.onerror = error => reject(error)
            GM_xmlhttpRequest(details)
        })
    }
}
