import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceProcessor, GLOBAL_CURRENCIES, CurrencyDef } from './PriceProcessor';
import { SettingManager } from '../setting/SettingManager';
import { RateManager } from '../rate/RateManager';

// Mock Managers
vi.mock('../setting/SettingManager', () => ({
    SettingManager: {
        instance: {
            setting: {
                countyCode: 'US',
                currencySymbol: '$',
                currencySymbolBeforeValue: true
            }
        }
    }
}));

vi.mock('../rate/RateManager', () => ({
    RateManager: {
        instance: {
            getRate: vi.fn()
        }
    }
}));

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
    const defaultRate = 1.0;
    const targetSymbol = '¥';

    beforeEach(() => {
        vi.clearAllMocks();
        // 设置默认配置
        SettingManager.instance.setting.currencySymbol = targetSymbol;
        SettingManager.instance.setting.currencySymbolBeforeValue = true;
        // @ts-ignore
        RateManager.instance.getRate.mockResolvedValue(defaultRate);
    });

    it('【规格回验集】验证全量区域在真实 DNA 下的解析准确度', async () => {
        let baseVal = 100;

        for (const [index, def] of GLOBAL_CURRENCIES.entries()) {
            SettingManager.instance.setting.countyCode = def.cc;

            const v1 = baseVal + index;
            const rawV2 = (baseVal * 100) + index + 0.99;

            const val1 = def.fractionDigits === 0 ? v1 : v1 + 0.5;
            const val2 = def.fractionDigits === 0 ? Math.round(rawV2) : rawV2;

            for (const val of [val1, val2]) {
                const text = formatSpecPrice(val, def);
                const result = await PriceProcessor.convertContent(text);

                const expected = `${text}(${targetSymbol}${val})`;
                try {
                    expect(result).toBe(expected);
                } catch (e) {
                    console.error(`[Assertion Failed] ${def.code} (${def.cc})`);
                    console.error(`Input:    "${text}"`);
                    console.error(`Expected: "${expected}"`);
                    console.error(`Got:      "${result}"`);
                    throw e;
                }
            }
        }
    });

    it('【终极复合压力】全区域混合递增数据解构', async () => {
        // 构建全区域混合文本
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

        const megaText = specs.map(s => `[${s.def.code}] ${s.text}`).join(' | ');
        const result = await PriceProcessor.convertContent(megaText);

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
        it('拦截所有无锚点的纯数字 (即便符合 DNA)', async () => {
            const noise = 'Update 1.0.2 for App:76561198000. Version: 5.0. Count: 4000. Price: 62.99';
            const result = await PriceProcessor.convertContent(noise);
            expect(result).toBe(noise);
        });
    });
});
