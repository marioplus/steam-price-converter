import { countyInfos } from '../county/CountyInfo';

/**
 * 货币详细规格定义
 */
export interface CurrencyDef {
    code: string;           // ISO 代码 (如 USD)
    symbol: string;         // 显示符号 (如 $)
    decimalSep: string | null;  // 小数位分隔符 (如 . 或 ,)
    thousandsSep: string | null; // 千分位分隔符 (如 , 或 . 或 空格)
    fractionDigits: number; // 精度 (0 或 2)
    symbolPos: 'front' | 'end'; // 符号位置
    symbolGap: string;      // 符号与数字之间的间距 (如 " " 或 "")
    cc: string;             // 区域代码
}

/**
 * 运行时规格库：由项目 JSON 数据源 (county-data.json) 驱动
 */
export const GLOBAL_CURRENCIES: CurrencyDef[] = countyInfos.map(i => ({
    code: i.currencyCode,
    symbol: i.symbol,
    cc: i.code.toLowerCase(),
    decimalSep: i.decimalSep,
    thousandsSep: i.thousandsSep,
    fractionDigits: i.fractionDigits,
    symbolPos: i.symbolPos,
    symbolGap: i.symbolGap
}));

/**
 * 静态正则构建 (启动编译一次)
 */
const buildRegex = () => {
    const frontAnchors = Array.from(new Set([
        ...GLOBAL_CURRENCIES.filter(c => c.symbolPos === 'front').map(c => c.symbol.trim()),
        ...GLOBAL_CURRENCIES.map(c => c.code)
    ])).filter(Boolean).sort((a, b) => b.length - a.length);

    const endAnchors = Array.from(new Set([
        ...GLOBAL_CURRENCIES.filter(c => c.symbolPos === 'end').map(c => c.symbol.trim()),
        ...GLOBAL_CURRENCIES.map(c => c.code)
    ])).filter(Boolean).sort((a, b) => b.length - a.length);

    const frontPattern = frontAnchors.map(s => s.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('|');
    const endPattern = endAnchors.map(s => s.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('|');

    const sepPattern = Array.from(new Set(
        GLOBAL_CURRENCIES.flatMap(c => [c.decimalSep, c.thousandsSep]).filter(Boolean)
    )).map(s => s === ' ' ? '\\s' : s!.replace(/[$^*+?()|[\]\\]/g, '\\$&')).join('');

    return new RegExp(`(?:(${frontPattern})\\s*)?(\\d[\\d${sepPattern}]*\\d|\\d)(?:\\s*(${endPattern}))?`, 'gi');
};

const PRICE_REGEX = buildRegex();

/**
 * 智能价格处理器
 */
export class PriceProcessor {
    /**
     * 核心处理：全动态扫描
     */
    public static processText(
        text: string,
        rate: number,
        countryCode: string,
        currencySymbol: string,
        isBefore: boolean
    ): string {
        const currentCC = countryCode.toLowerCase();

        return text.replace(PRICE_REGEX, (wholeMatch, prefix, digits, suffix) => {
            const config = this.matchConfig(prefix || "", digits, suffix || "", currentCC);

            // 严格驱动：必须命中规格规则才进行处理
            if (!config) return wholeMatch;

            const val = this.parseWithConfig(digits, config);
            if (val === null || isNaN(val)) return wholeMatch;

            const converted = Number.parseFloat((val / rate).toFixed(2));
            const formatted = isBefore
                ? `(${currencySymbol}${converted})`
                : `(${converted}${currencySymbol})`;

            return `${wholeMatch}${formatted}`;
        });
    }

    /**
     * 规格契合度匹配算法
     */
    private static matchConfig(prefix: string, digits: string, suffix: string, currentCC: string): CurrencyDef | null {
        const pre = prefix.trim().toUpperCase();
        const suf = suffix.trim().toUpperCase();

        if (!pre && !suf) return null;

        const candidates = GLOBAL_CURRENCIES.filter(c => {
            const sym = c.symbol.trim().toUpperCase();
            const code = c.code.toUpperCase();
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
        const sameCC = finalCandidates.find(c => c.cc === currentCC);
        if (sameCC) return sameCC;

        const usDefault = finalCandidates.find(c => c.cc === 'us');
        return usDefault || finalCandidates[0];
    }

    /**
     * 小数位特征识别 (Steam 专家知识)
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
    private static parseWithConfig(digits: string, def: CurrencyDef): number | null {
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
