import {Setting} from './Setting'
import {GM_getValue, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {STORAGE_KEY_SETTING} from '../constant/Constant'

export class SettingManager {
    public static instance: SettingManager = new SettingManager()
    setting: Setting

    private constructor() {
        this.setting = this.loadSetting()
    }

    private loadSetting(): Setting {
        const json = GM_getValue(STORAGE_KEY_SETTING, new Setting().toJsonString())
        const setting = new Setting().readJsonString(json)
        console.log(`读取设置`, setting)
        return setting
    }

    /**
     * 保存设置
     * @param setting  设置
     */
    public saveSetting(setting: Setting) {
        console.log(`保存设置`, setting)
        GM_setValue(STORAGE_KEY_SETTING, setting.toJsonString())
    }
}
