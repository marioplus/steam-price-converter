import {ICountyInfoGetter} from "./ICountyInfoGetter";

export class UserConfigCountyInfoGetter implements ICountyInfoGetter {

    async getCountyCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // @ts-ignore
            const code = window.UserConfig?.country_code
            if (code) {
                resolve(code)
            }
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