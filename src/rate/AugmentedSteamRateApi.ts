import {IRateApi} from './IRateApi'
import {Http} from '../utils/Http'
import {Logger} from '../utils/Logger'
import {Strings} from '../utils/Strings'
import {SpcContext} from '../SpcContext'

export class AugmentedSteamRateApi implements IRateApi {

    getName(): string {
        return 'AugmentedSteamRateApi'
    }

    async getRate(): Promise<number> {
        const context = SpcContext.getContext()
        Logger.info(Strings.format('通过 AugmentedSteam 获取汇率 %s(%s) -> %s(%s)...',
            context.currentCountyInfo.currencyCode,
            context.currentCountyInfo.name,
            context.targetCountyInfo.currencyCode,
            context.targetCountyInfo.name))
        const url = `https://api.augmentedsteam.com/rates/v1?to=${context.currentCountyInfo.currencyCode}`
        let rate: number | void | null = await Http.get(Map<String, { [key in string]: number }>, url)
            .then(res => res.get(context.targetCountyInfo.currencyCode)![context.currentCountyInfo.currencyCode])
            .catch(err => Logger.error('通过 AugmentedSteam 获取汇率失败', err))
        if (rate) {
            return rate
        }
        throw new Error(`通过 ${this.getName()} 获取汇率失败。`)
    }

}
