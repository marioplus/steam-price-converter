import {ClassConstructor} from 'class-transformer'
import {GM_deleteValue, GM_getValue, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {JsonUtils} from './JsonUtils'

export class GmUtils {
    public static getValue<T>(cls: ClassConstructor<T>, key: string, defaultValue: T): T {
        const value = GM_getValue(key)
        return value?JsonUtils.readJsonString(value as string, cls):defaultValue;
    }

    public static setValue<T>(key: string, value: T): void {
        GM_setValue(key, JsonUtils.toJsonString(value))
    }

    public static deleteValue(key: string) {
        GM_deleteValue(key)
    }
}
