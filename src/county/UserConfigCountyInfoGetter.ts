import {ICountyInfoGetter} from "./ICountyInfoGetter";
import {Logger} from "../utils/Logger";

export class UserConfigCountyInfoGetter implements ICountyInfoGetter {

    async getCountyCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                // @ts-ignore
                const code = window.UserConfig?.country_code
                if (code) {
                    resolve(code)
                }
            } catch (e: any) {
                Logger.warn('读取window.UserConfig变量失败： ' + e.message)
            }

            // window.UserConfig={"logged_in":true,"steamid":"76561199160716481","accountid":1200450753,"is_support":false,"is_limited":false,"is_partner_member":false,"country_code":"CN"};
            document.querySelectorAll('script').forEach(scriptEl => {
                const scriptInnerText = scriptEl.innerText
                const regex: RegExp = /,"country_code"="([A-Z]{2})"/
                const match = regex.exec(scriptInnerText)
                if (match) {
                    resolve(match[1])
                }
            })
            reject()
        });
    }

    match(): boolean {
        return true;
    }

    name(): string {
        return "window.UserConfig";
    }

}