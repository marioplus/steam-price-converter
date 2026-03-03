import { countyInfos, CountyInfo } from '../county/CountyInfo';
import { RateManager } from '../rate/RateManager';
import { SettingManager } from '../setting/SettingManager';
import { SpcContext } from '../SpcContext';
import { Logger } from '../utils/Logger';

// ─── 工具函数 ───────────────────────────────────────────

/** 转义正则特殊字符 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── 模块级预计算（启动时执行一次） ──────────────────────

/** 从所有 CountyInfo 收集分隔符，构建数字块正则 */
const allSepChars = Array.from(new Set(
    countyInfos.flatMap(c => [c.decimalSep, c.thousandsSep].filter(Boolean) as string[])
)).map(s => s === ' ' ? '\\s' : escapeRegex(s)).join('');

const NUMBER_BLOCK_REGEX = new RegExp(`\\d[\\d${allSepChars}]*\\d|\\d`, 'g');

/** 预排序的规则模板（符号长度降序 → 有小数位优先 → currencyCode 字母序） */
const SORTED_RULES_TEMPLATE = [...countyInfos]
    .sort((a, b) => b.symbol.length - a.symbol.length
        || Number(a.fractionDigits === 0) - Number(b.fractionDigits === 0)
        || a.currencyCode.localeCompare(b.currencyCode));

// ─── 符号匹配 ──────────────────────────────────────────

/**
 * 检查数字块前后上下文是否匹配某条规则的符号
 * symbolGap 是 DNA 的一部分，直接精确匹配
 */
function tryMatchSymbol(
    text: string,
    numStart: number,
    numEnd: number,
    info: CountyInfo
): { matchStart: number; matchEnd: number } | null {
    if (info.symbolPos === 'front') {
        // 前置：数字左侧应为 symbol + symbolGap
        const prefix = info.symbol + info.symbolGap;
        const start = numStart - prefix.length;
        if (start < 0) return null;
        const slice = text.substring(start, numStart);
        if (slice.toUpperCase() !== prefix.toUpperCase()) return null;
        return { matchStart: start, matchEnd: numEnd };
    } else {
        // 后置：数字右侧应为 symbolGap + symbol
        const suffix = info.symbolGap + info.symbol;
        const end = numEnd + suffix.length;
        if (end > text.length) return null;
        const slice = text.substring(numEnd, end);
        if (slice.toUpperCase() !== suffix.toUpperCase()) return null;
        return { matchStart: numStart, matchEnd: end };
    }
}

// ─── DNA 校验 ──────────────────────────────────────────

/** 校验数字块的分隔符是否符合该币种的 DNA 规则 */
function validateNumberDNA(numStr: string, info: CountyInfo): boolean {
    const seps = new Set(
        numStr.replace(/\d/g, '').split('').filter(Boolean).map(s => /\s/.test(s) ? ' ' : s)
    );

    // 每个分隔符必须是该规则定义的千分位或小数分隔符
    for (const sep of seps) {
        if (sep !== info.thousandsSep && sep !== info.decimalSep) {
            return false;
        }
    }

    // 无小数位的币种不应包含小数分隔符
    if (info.fractionDigits === 0 && info.decimalSep && seps.has(info.decimalSep)) {
        return false;
    }

    return true;
}

// ─── 数字解析 ──────────────────────────────────────────

/** 根据规则的分隔符配置直接解析数字文本 */
function parseNumber(numStr: string, info: CountyInfo): number | null {
    let clean = numStr;

    // 去掉千分位分隔符
    if (info.thousandsSep) {
        clean = clean.split(info.thousandsSep).join('');
    }

    // 小数分隔符统一为 '.'
    if (info.decimalSep && info.decimalSep !== '.') {
        clean = clean.replace(info.decimalSep, '.');
    }

    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
}

// ─── 匹配结果类型 ──────────────────────────────────────

interface PriceMatch {
    index: number;
    length: number;
    value: number;
    info: CountyInfo;
    raw: string;
}

// ─── 核心处理器 ────────────────────────────────────────

/**
 * 数据驱动的价格处理器
 *
 * 单次扫描找数字块 + 上下文符号匹配，当前区域优先。
 * 流程：预检 → 数字块扫描 → 符号匹配 + DNA 校验 → 汇率转换 → 反向替换
 */
export class PriceProcessor {

    /**
     * 统一转换入口
     */
    public static async convertContent(text: string): Promise<string> {
        const setting = SettingManager.instance.setting;
        const targetCode = SpcContext.getContext().targetCountyInfo.code;
        return await this.processTextAsync(
            text,
            setting.countyCode,
            setting.currencySymbol,
            setting.currencySymbolBeforeValue,
            targetCode
        );
    }

    /**
     * 异步管道处理：预检 → 数字块扫描 → 符号匹配 → 预热汇率 → 反向替换
     */
    private static async processTextAsync(
        text: string,
        countryCode: string,
        targetSymbol: string,
        isBefore: boolean,
        targetCode: string
    ): Promise<string> {
        // 快速预检：无数字直接返回
        if (!/\d/.test(text)) return text;

        // 当前区域规则（优先匹配）
        const currentRule = countyInfos.find(c => c.code === targetCode);
        // 其他规则（按符号长度降序，排除当前区域和目标区域）
        const otherRules = SORTED_RULES_TEMPLATE.filter(c => {
            return c.code !== countryCode && c.code !== targetCode;
        });

        const matches: PriceMatch[] = [];

        // 单次扫描：找所有数字块
        for (const numMatch of text.matchAll(NUMBER_BLOCK_REGEX)) {
            const numStr = numMatch[0];
            const numStart = numMatch.index!;
            const numEnd = numStart + numStr.length;

            let matched = false;

            // 优先尝试当前区域
            if (currentRule && currentRule.code !== targetCode) {
                matched = this.tryRule(text, numStr, numStart, numEnd, currentRule, matches);
            }

            // 未命中则按符号长度降序尝试其他区域
            if (!matched) {
                for (const rule of otherRules) {
                    if (this.tryRule(text, numStr, numStart, numEnd, rule, matches)) break;
                }
            }
        }

        if (matches.length === 0) return text;

        // 预热汇率
        const uniqueCurrencies = [...new Set(matches.map(m => m.info.currencyCode))];
        const rateMap = new Map<string, number>();

        await Promise.all(uniqueCurrencies.map(async (code) => {
            try {
                const rate = await RateManager.instance.getRate(code);
                rateMap.set(code, rate);
            } catch (e) {
                Logger.error(`[PriceProcessor] 获取币种汇率失败: ${code}`, e);
            }
        }));

        // 反向替换（按 index 降序，避免索引偏移）
        let result = text;
        matches.sort((a, b) => b.index - a.index);
        for (const m of matches) {
            const rate = rateMap.get(m.info.currencyCode);
            if (!rate) continue;

            const converted = Number.parseFloat((m.value / rate).toFixed(2));
            const formatted = isBefore
                ? `(${targetSymbol}${converted})`
                : `(${converted}${targetSymbol})`;

            result = result.substring(0, m.index) + m.raw + formatted + result.substring(m.index + m.length);
        }

        Logger.debug(`[PriceProcessor] 转换成功，命中 ${matches.length} 处价格`);
        return result;
    }

    /** 尝试用一条规则匹配数字块：符号匹配 → DNA 校验 → 数字解析 */
    private static tryRule(
        text: string,
        numStr: string,
        numStart: number,
        numEnd: number,
        info: CountyInfo,
        matches: PriceMatch[]
    ): boolean {
        const range = tryMatchSymbol(text, numStart, numEnd, info);
        if (!range) return false;
        if (!validateNumberDNA(numStr, info)) return false;

        const value = parseNumber(numStr, info);
        if (value === null) return false;

        const raw = text.substring(range.matchStart, range.matchEnd);
        matches.push({
            index: range.matchStart,
            length: raw.length,
            value,
            info,
            raw
        });
        return true;
    }
}
