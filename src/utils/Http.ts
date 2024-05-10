import {GM_xmlhttpRequest} from 'vite-plugin-monkey/dist/client'
import {XhrRequest} from '$'
import {ClassConstructor, plainToInstance} from 'class-transformer'

export class Http {

    static get<T>(cls: ClassConstructor<T>, url: string, details?: XhrRequest): Promise<T> {
        if (!details) {
            details = {url}
        }
        details.method = 'GET'
        return this.request<T>(cls, details)
    }

    static post<T>(url: string, cls: ClassConstructor<T>, details?: XhrRequest): Promise<T> {
        if (!details) {
            details = {url}
        }
        details.method = 'POST'
        return this.request<T>(cls, details)
    }

    private static request<T>(cls: ClassConstructor<T>, details: XhrRequest): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            details.onload = response => {
                const json = JSON.parse(response.response)
                resolve(plainToInstance(cls, json))
            }
            details.onerror = error => reject(error)
            GM_xmlhttpRequest(details)
        })
    }

}
