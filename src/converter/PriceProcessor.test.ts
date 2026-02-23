import { describe, it, expect } from 'vitest';
import { PriceProcessor, GLOBAL_CURRENCIES, CurrencyDef } from './PriceProcessor';

/**
 * 高级规格生产器：确保生成的数据 100% 符合币种的 DNA
 */
function formatSpecPrice(value: number, def: CurrencyDef): string {
    let priceStr = '';

    if (def.fractionDigits === 0) {
        // 纯整数
        let intStr = Math.round(value).toString();
        // 仅在规则定义了千分位时才添加
        if (def.thousandsSep && intStr.length > 3) {
            intStr = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, def.thousandsSep);
        }
        priceStr = intStr;
    } else {
        // 小数位
        let parts = value.toFixed(def.fractionDigits).split('.');
        let intPart = parts[0];
        let fracPart = parts[1];

        // 仅在规则定义了千分位时才添加
        if (def.thousandsSep && intPart.length > 3) {
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, def.thousandsSep);
        }
        priceStr = intPart + (def.decimalSep || '.') + fracPart;
    }

    return def.symbolPos === 'front'
        ? `${def.symbol}${def.symbolGap}${priceStr}`
        : `${priceStr}${def.symbolGap}${def.symbol}`;
}

describe('PriceProcessor 规格对齐自动化回归', () => {
    const rate = 1.0;
    const targetSymbol = '¥';

    it('【规格回验集】验证全量区域在真实 DNA 下的解析准确度', () => {
        let baseVal = 100;

        const isBefore = true;
        GLOBAL_CURRENCIES.forEach((def, index) => {
            // 根据区域 DNA 决定数值形态
            const v1 = baseVal + index;
            const rawV2 = (baseVal * 100) + index + 0.99;

            // 严格对齐规则：如果规则规定是整数，则 ground truth 也必须是整数
            const val1 = def.fractionDigits === 0 ? v1 : v1 + 0.5;
            const val2 = def.fractionDigits === 0 ? Math.round(rawV2) : rawV2;

            [val1, val2].forEach(val => {
                const text = formatSpecPrice(val, def);
                const result = PriceProcessor.processText(text, rate, def.cc, targetSymbol, true);

                // 逐一精准断言
                const expected = isBefore
                    ? `${text}(${targetSymbol}${val})`
                    : `${text}(${val}${targetSymbol})`;
                try {
                    expect(result).toBe(expected);
                } catch (e) {
                    console.error(`[Assertion Failed] ${def.code} (${def.cc})`);
                    console.error(`Input:    "${text}"`);
                    console.error(`Expected: "${expected}"`);
                    console.error(`Got:      "${result}"`);
                    throw e;
                }
            });
        });
    });

    it('【终极复合压力】全区域混合递增数据解构', () => {
        // 构建全区域混合文本，使用递增 ID 以便区分
        const specs = GLOBAL_CURRENCIES
            .flatMap((def, i) => {
                const v1 = 5000 + i;
                let v2 = 0
                if (def.fractionDigits === 0) {
                    v2 = 50 + i;
                } else {
                    v2 = 50.05 + i;
                }
                return [{
                    def,
                    val: v1,
                    text: formatSpecPrice(v1, def),
                }, {
                    def,
                    val: v2,
                    text: formatSpecPrice(v2, def),
                }].map(s => {
                    const normVal = Number.parseFloat(Number(s.val).toFixed(2));
                    return {
                        ...s,
                        expected: `${s.text.trimEnd()}(${targetSymbol}${normVal})`
                    };
                });
            });

        const isBefore = true;
        const megaText = specs.map(s => `[${s.def.code}] ${s.text}`).join(' | ');
        const result = PriceProcessor.processText(megaText, rate, 'us', targetSymbol, isBefore);

        // 逐一验证每个节点
        specs.forEach(s => {
            try {
                expect(result).toContain(s.expected);
            } catch (e) {
                console.error(`Spec: `, s);
                console.error(`Raw:  "${megaText}"`);
                console.error(`Got:  "${result}"`);
                throw e;
            }
        });

        // 验证总数
        const totalMatches = (result.match(/\(¥/g) || []).length;
        expect(totalMatches).toBe(GLOBAL_CURRENCIES.length * 2);
    });

    describe('【鲁棒性】锚点强制与规格边界', () => {
        it('拦截所有无锚点的纯数字 (即便符合 DNA)', () => {
            const noise = 'Update 1.0.2 for App:76561198000. Version: 5.0. Count: 4000. Price: 62.99';
            const result = PriceProcessor.processText(noise, rate, 'cn', targetSymbol, true);
            expect(result).toBe(noise);
        });
    });
});
