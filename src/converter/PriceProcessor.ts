import { countyInfos, CountyInfo } from '../county/CountyInfo';
import { RateManager } from '../rate/RateManager';
import { SettingManager } from '../setting/SettingManager';
import { SpcContext } from '../SpcContext';
import { Logger } from '../utils/Logger';

/**
 * 静态正则构建 (启动编译一次)
 */
const buildRegex = () => {
    const frontAnchors = Array.from(new Set([
        ...countyInfos.filter(c => c.symbolPos === 'front').map(c => c.symbol.trim()),
        ...countyInfos.map(c => c.currencyCode)
    ])).filter(Boolean).sort((a, b) => b.length - a.length);

    const endAnchors = Array.from(new Set([
        ...countyInfos.filter(c => c.symbolPos === 'end').map(c => c.symbol.trim()),
        ...countyInfos.map(c => c.currencyCode)
    ])).filter(Boolean).sort((a, b) => b.length - a.length);

    const frontPattern = frontAnchors.map(s => s.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('|');
    const endPattern = endAnchors.map(s => s.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('|');

    const sepPattern = Array.from(new Set(
        countyInfos.flatMap(c => [c.decimalSep, c.thousandsSep]).filter(Boolean)
    )).map(s => s === ' ' ? '\\s' : s!.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('');

    return new RegExp(`(?:(${frontPattern})\\s*)?(\\d[\\d${sepPattern}]*\\d|\\d)(?:\\s*(${endPattern}))?`, 'gi');
};

const PRICE_REGEX = buildRegex();

/**
 * 智能价格处理器
 */
export class PriceProcessor {

    /**
     * 统一转换入口 (合并了 ConvertUtils 逻辑)
     */
    public static async convertContent(text: string): Promise<string> {
        const setting = SettingManager.instance.setting;
        return await this.processTextAsync(
            text,
            setting.countyCode,
            setting.currencySymbol,
            setting.currencySymbolBeforeValue
        );
    }

    /**
     * 异步管道处理：扫描 -> 预热汇率 -> 反向按序替换
     */
    private static async processTextAsync(
        text: string,
        countryCode: string,
        targetSymbol: string,
        isBefore: boolean
    ): Promise<string> {
        const currentCC = countryCode.toLowerCase();
        const matches: {
            index: number;
            length: number;
            value: number;
            config: CountyInfo;
            whole: string;
        }[] = [];

        // 扫描
        const iterator = text.matchAll(PRICE_REGEX);
        const targetCode = SpcContext.getContext().targetCountyInfo.code.toLowerCase();
        for (const match of iterator) {
            const [whole, prefix, digits, suffix] = match;
            const info = this.matchConfig(prefix || "", digits, suffix || "", currentCC);
            if (info) {
                // 如果国家相同则不转换
                if (info.code.toLowerCase() === targetCode) continue;
                const val = this.parseWithConfig(digits, info);
                if (val !== null && !isNaN(val)) {
                    matches.push({
                        index: match.index!,
                        length: whole.length,
                        value: val,
                        config: info,
                        whole
                    });
                }
            }
        }

        if (matches.length === 0) return text;

        // 预热汇率
        const uniqueCurrencies = Array.from(new Set(matches.map(m => m.config.currencyCode)));
        const rateMap = new Map<string, number>();

        await Promise.all(uniqueCurrencies.map(async (code) => {
            try {
                const rate = await RateManager.instance.getRate(code);
                rateMap.set(code, rate);
            } catch (e) {
                Logger.error(`[PriceProcessor] 获取币种汇率失败: ${code}`, e);
            }
        }));

        // 替换
        let result = text;
        for (let i = matches.length - 1; i >= 0; i--) {
            const m = matches[i];
            const rate = rateMap.get(m.config.currencyCode);
            if (!rate) continue;

            const converted = Number.parseFloat((m.value / rate).toFixed(2));
            const formatted = isBefore
                ? `(${targetSymbol}${converted})`
                : `(${converted}${targetSymbol})`;

            result = result.substring(0, m.index) + m.whole + formatted + result.substring(m.index + m.length);
        }

        Logger.debug(`[PriceProcessor] 转换成功，命中 ${matches.length} 处价格`);
        return result;
    }

    /**
     * 规格契合度匹配算法
     */
    private static matchConfig(prefix: string, digits: string, suffix: string, currentCC: string): CountyInfo | null {
        const pre = prefix.trim().toUpperCase();
        const suf = suffix.trim().toUpperCase();

        if (!pre && !suf) return null;

        const candidates = countyInfos.filter(c => {
            const sym = c.symbol.trim().toUpperCase();
            const code = c.currencyCode.toUpperCase();
            if (pre) {
                if (pre === sym && c.symbolPos === 'front') return true;
                if (pre === code) return true;
                if (pre.includes(sym) && c.symbolPos === 'front') return true;
            }
            if (suf) {
                if (suf === sym && c.symbolPos === 'end') return true;
                if (suf === code) return true;
                if (suf.includes(sym) && c.symbolPos === 'end') return true;
            }
            return false;
        });

        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];

        const hasDecimal = this.detectHasDecimal(digits);
        const modeMatched = candidates.filter(c => (c.fractionDigits > 0) === hasDecimal);
        if (modeMatched.length === 1) return modeMatched[0];

        const finalCandidates = modeMatched.length > 0 ? modeMatched : candidates;
        const sameCC = finalCandidates.find(c => c.code.toLowerCase() === currentCC);
        if (sameCC) return sameCC;

        const usDefault = finalCandidates.find(c => c.code.toLowerCase() === 'us');
        return usDefault || finalCandidates[0];
    }

    /**
     * 小数位特征识别
     */
    private static detectHasDecimal(digits: string): boolean {
        const clean = digits.trim().replace(/\s/g, '');
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');
        const lastSep = Math.max(lastDot, lastComma);

        if (lastSep === -1) return false;
        const suffix = clean.substring(lastSep + 1);
        return suffix.length === 1 || suffix.length === 2;
    }

    /**
     * 数字文本解析
     */
    private static parseWithConfig(digits: string, def: CountyInfo): number | null {
        const clean = digits.trim().replace(/\s/g, '');
        const separators = Array.from(new Set(clean.replace(/\d/g, '').split('')));
        for (const sep of separators) {
            if (sep !== def.decimalSep && sep !== def.thousandsSep) return null;
        }

        if (def.decimalSep) {
            if ((clean.split(def.decimalSep).length - 1) > 1) return null;
        }

        if (def.fractionDigits === 0) return parseInt(clean.replace(/\D/g, ''));

        const lastSepIdx = Math.max(
            def.decimalSep ? clean.lastIndexOf(def.decimalSep) : -1,
            def.thousandsSep ? clean.lastIndexOf(def.thousandsSep) : -1
        );

        if (lastSepIdx === -1) return parseInt(clean.replace(/\D/g, ''));

        const suffix = clean.substring(lastSepIdx + 1);
        if (suffix.length === 1 || suffix.length === 2) {
            const body = clean.substring(0, lastSepIdx).replace(/\D/g, '');
            return parseFloat(`${body}.${suffix}`);
        }
        return parseInt(clean.replace(/\D/g, ''));
    }
}
