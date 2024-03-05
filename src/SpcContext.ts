import {CountyInfo} from './county/CountyInfo'
import {Setting} from './setting/Setting'
import {unsafeWindow} from 'vite-plugin-monkey/dist/client'

export class SpcContext {

    private readonly _setting: Setting
    private readonly _targetCountyInfo: CountyInfo
    private readonly _currentCountyInfo: CountyInfo

    constructor(setting: Setting, targetCountyInfo: CountyInfo, targetCountyCode: CountyInfo) {
        this._setting = setting
        this._targetCountyInfo = targetCountyInfo
        this._currentCountyInfo = targetCountyCode
    }

    public static getContext(): SpcContext {
        // @ts-ignore
        return unsafeWindow.spcContext
    }


    get setting(): Setting {
        return this._setting
    }

    get targetCountyInfo(): CountyInfo {
        return this._targetCountyInfo
    }

    get currentCountyInfo(): CountyInfo {
        return this._currentCountyInfo
    }
}
