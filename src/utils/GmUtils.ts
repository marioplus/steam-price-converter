import {GM_deleteValue, GM_getValue, GM_openInTab, GM_registerMenuCommand, GM_setValue} from '$'
import {GM_addValueChangeListener} from 'vite-plugin-monkey/dist/client'
import {Logger} from './Logger'
import {ClassConstructor, Jsons} from './Jsons'

export class GmUtils {
    public static getSimpleValue<T>(key: string, defaultValue: T): T {
        const value = GM_getValue<T>(key)
        return value || defaultValue
    }

    public static getObjValue<T extends object>(cls: ClassConstructor<T>, key: string, defaultValue: T): T {
        const value = GM_getValue(key)
        return value ? Jsons.readString<T>(value as string, cls) : defaultValue
    }

    public static setSimpleValue<T>(key: string, value: T) {
        GM_setValue(key, value)
    }

    public static setObjValue(key: string, value: any): void {
        GM_setValue(key, Jsons.toString(value))
    }

    public static deleteValue(key: string) {
        GM_deleteValue(key)
    }

    public static registerMenuCommand(caption: string, onClick?: () => void) {
        const menuValueKey = GmUtils.buildMenuValueKey(caption)
        GM_registerMenuCommand(caption, () => {
            GmUtils.setSimpleValue(menuValueKey, new Date().getTime())
            Logger.debug('点击菜单：' + caption)
            if (onClick) {
                onClick()
            }
        })
    }

    public static addMenuClickEventListener(caption: string,
                                            onClick: () => void) {
        const menuValueKey = GmUtils.buildMenuValueKey(caption)
        GM_addValueChangeListener<any>(menuValueKey, onClick)
    }

    public static buildMenuValueKey(caption: string): string {
        return `GM_registerMenuCommand@${caption}`
    }

    public static openInTab(url: string) {
        GM_openInTab(url)
    }
}
