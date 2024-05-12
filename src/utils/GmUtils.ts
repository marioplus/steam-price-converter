import {ClassConstructor} from 'class-transformer'
import {JsonUtils} from './JsonUtils'
import {GM_deleteValue, GM_getValue, GM_registerMenuCommand, GM_setValue} from '$'
import {GM_addValueChangeListener} from 'vite-plugin-monkey/dist/client'
import {Logger} from './Logger'

export class GmUtils {
    public static getValue<T>(cls: ClassConstructor<T>, key: string, defaultValue: T): T {
        const value = GM_getValue(key)
        return value ? JsonUtils.readJsonString(value as string, cls) : defaultValue
    }

    public static setValue(key: string, value: any): void {
        GM_setValue(key, JsonUtils.toJsonString(value))
    }

    public static deleteValue(key: string) {
        GM_deleteValue(key)
    }

    public static registerMenuCommand<T extends MouseEvent | KeyboardEvent>(caption: string,
                                                                            onClick?: (event: T) => void,
                                                                            accessKey?: string | undefined) {
        const key = `GM_registerMenuCommand@${caption}`
        GM_registerMenuCommand(
            caption,
            event => {
                this.setValue(key, true)
                Logger.debug('点击菜单：' + caption)
                this.setValue(key, false)
                if (onClick) {
                    onClick(event as T)
                }
            },
            accessKey)
    }

    public static addMenuClickEventListener(caption: string,
                                            onClick: () => void) {
        const key = `GM_registerMenuCommand@${caption}`
        // @ts-ignore
        GM_addValueChangeListener<boolean>(key, (name, oldValue, newValue) => {
            if (newValue) {
                onClick()
            }
        })
    }
}
