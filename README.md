# steam-price-converter

一个 Tampermonkey 插件，能将 steam 商店和市场的的价格转换为某种货币展示。理论上支持所有区域。

## 使用

### 安装

脚本托管于 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/452504-steam%E4%BB%B7%E6%A0%BC%E8%BD%AC%E6%8D%A2)

由于脚本使用了某种[特别的东西](https://github.com/BeyondDimension/SteamTools/issues/2497)，Greasy Fork上的脚本不能直接导入steam++，~~需要使用 [releases](https://github.com/marioplus/steam-price-converter/releases) 中额外构建的版本。~~

### 设置

默认将价格转化为人名币，如果需要转换其他货币展示可以在设置页面进行设置，所有设置都是实时生效的。

![](https://s3.bmp.ovh/imgs/2023/06/09/de3f84f9f3c2c1f0.jpg)
![](https://s3.bmp.ovh/imgs/2023/06/09/f500fb8f8517953d.jpg)

## 开发

根据[此处](https://github.com/lisonge/vite-plugin-monkey/issues/1)提示关闭 Tampermonkey 的 CSP 检测

```shell
npm i
npm run dev
```

## 发布

```shell
npm run build
```

## 已知问题

1. 在未登录的状态下访问市场，可能或出现货币转换不正确
2. [市场首页](https://steamcommunity.com/market/)会出现转换不及时的情况

## 效果展示

- 香港

  ![香港](https://s3.bmp.ovh/imgs/2022/10/05/6846453fc306362c.png)
- 台湾

  ![台湾](https://s3.bmp.ovh/imgs/2022/10/05/14e9bc3760657721.png)
- 新加坡

  ![新加坡](https://s3.bmp.ovh/imgs/2022/10/05/38ca54a79b9ed8bd.png)
- 日本

  ![日本](https://s3.bmp.ovh/imgs/2022/10/05/aeab092828370c3f.png)
- 韩国

  ![韩国](https://s3.bmp.ovh/imgs/2022/10/05/1db32a99e1176c58.png)
- 美国

  ![美国](https://s3.bmp.ovh/imgs/2022/10/05/947c49e4d1b2d452.png)
- 加拿大

  ![加拿大](https://s3.bmp.ovh/imgs/2022/10/05/a82b8d29e90f2662.png)
- 泰国

  ![泰国](https://s3.bmp.ovh/imgs/2022/10/05/63f135d0f3bc3b67.png)
- 英国

  ![英国](https://s3.bmp.ovh/imgs/2022/10/05/c837a7fb2a68e996.png)
- 德国

  ![德国](https://s3.bmp.ovh/imgs/2022/10/05/7d72efc7e10479f4.png)
- 俄罗斯

  ![俄罗斯](https://s3.bmp.ovh/imgs/2022/10/05/93718d86a3fa2635.png)
- 印度

  ![印度](https://s3.bmp.ovh/imgs/2022/10/05/793a93213c2ed841.png)
- 法国

  ![法国](https://s3.bmp.ovh/imgs/2022/10/05/c833b9d57c6b172f.png)
- 阿根廷

  ![阿根廷](https://s3.bmp.ovh/imgs/2022/10/05/7f77627cdc0526e5.png)
- 巴西

  ![巴西](https://s3.bmp.ovh/imgs/2022/10/05/29ffdade87a79a76.png)
- 土耳其

  ![土耳其](https://s3.bmp.ovh/imgs/2022/10/05/0717bfc0df89dcd7.png)
- 澳大利亚

  
## 全球 Steam 价格格式参考

为了实现极致稳定的“智能价格提取”，本项目对 Steam 目前活跃的 37 种本币结算货币进行了实测调研。

### 调研方法
本项目的数据来源主要分为两部分：

1. **货币定义与列表**：参考 [Steamworks 官方文档 - Supported Currencies](https://partner.steamgames.com/doc/store/pricing/currencies) 获取活跃的 ECurrency ID 及其对应的 ISO 4217 代码。
2. **格式实测**：通过访问 Steam 官方搜索页面并强制指定区域代码（Country Code）获取真实的 UI 渲染效果：
   `https://store.steampowered.com/search/?sort_by=Price_DESC&cc=[region_code]`

通过这种方式，我们将官方提供的技术规范与实际前端的显示习惯相结合，确保了价格解析的准确性。

### 数据整理与解析模式
基于实测数据，我们将这 37 种货币归纳为以下三种**解析模式**，这决定了转换引擎的行为：

1. **整数模式 (Integer Mode)**：
   - 特征：ISO 4217 指数为 0，文本中的 `.` 或 `,` 均为千分位。
   - 典型：JPY, KRW, VND, IDR。
2. **点号小数点模式 (Dot Decimal Mode)**：
   - 特征：使用 `.` 作为小数点。
   - 典型：CNY, USD, GBP, HKD。
3. **逗号小数点模式 (Comma Decimal Mode)**：
   - 特征：使用 `,` 作为小数点，`.` 或空格作为千分位。
   - 典型：EUR, RUB, PLN, BRL。

### 数据对照表 (37 种活跃本币)

| 序号 | 地区 (cc) | 货币 (Code) | 对应国家/地区 | 典型显示示例        | 小数点 | 千分位 | 符号位置 | 精度 |
| :--- | :-------- | :---------- | :------------ | :------------------ | :----- | :----- | :------- | :--- |
| 1    | us        | USD         | 美国          | `$499.00`           | `.`    | `,`    | 前置     | 2    |
| 2    | gb        | GBP         | 英国          | `£898.00`           | `.`    | `,`    | 前置     | 2    |
| 3    | de        | EUR         | 欧盟 (多国)   | `890,00€`           | `,`    | `.`    | 后置     | 2    |
| 4    | ch        | CHF         | 瑞士          | `CHF 935.00`        | `.`    | `'`    | 前置     | 2    |
| 5    | ru        | RUB         | 俄罗斯        | `1.249,00 руб`      | `,`    | `.`    | 后置     | 2    |
| 6    | pl        | PLN         | 波兰          | `3 550,00 zł`       | `,`    | 空格   | 后置     | 2    |
| 7    | br        | BRL         | 巴西          | `R$1.988,00`        | `,`    | `.`    | 前置     | 2    |
| 8    | jp        | JPY         | 日本          | `¥90,000`           | 无     | `,`    | 前置     | 0    |
| 9    | no        | NOK         | 挪威          | `8.300,00 kr`       | `,`    | `.`    | 后置     | 2    |
| 10   | id        | IDR         | 印度尼西亚    | `Rp 6 900 000`      | 无     | 空格   | 前置     | 0    |
| 11   | my        | MYR         | 马来西亚      | `RM1,800.00`        | `.`    | `,`    | 前置     | 2    |
| 12   | ph        | PHP         | 菲律宾        | `₱23,500.00`        | `.`    | `,`    | 前置     | 2    |
| 13   | sg        | SGD         | 新加坡        | `S$900.00`          | `.`    | `,`    | 前置     | 2    |
| 14   | th        | THB         | 泰国          | `฿18,500.00`        | `.`    | `,`    | 前置     | 2    |
| 15   | vn        | VND         | 越南          | `10.000.000₫`       | 无     | `.`    | 后置     | 0    |
| 16   | kr        | KRW         | 韩国          | `₩ 800,000`         | 无     | `,`    | 前置     | 0    |
| 17   | ua        | UAH         | 乌克兰        | `99 999,00₴`        | `,`    | 空格   | 后置     | 2    |
| 18   | mx        | MXN         | 墨西哥        | `Mex$ 8,000.00`     | `.`    | `,`    | 前置     | 2    |
| 19   | ca        | CAD         | 加拿大        | `C$ 970.00`         | `.`    | `,`    | 前置     | 2    |
| 20   | au        | AUD         | 澳大利亚      | `A$ 1,250.00`       | `.`    | `,`    | 前置     | 2    |
| 21   | nz        | NZD         | 新西兰        | `NZ$ 1,300.00`      | `.`    | `,`    | 前置     | 2    |
| 22   | cn        | CNY         | 中国          | `¥5,000.00`         | `.`    | `,`    | 前置     | 2    |
| 23   | in        | INR         | 印度          | `₹35,000.00`        | `.`    | `,`    | 前置     | 2    |
| 24   | cl        | CLP         | 智利          | `CLP$398.000`       | 无     | `.`    | 前置     | 0    |
| 25   | pe        | PEN         | 秘鲁          | `S/. 1,800.00`      | `.`    | `,`    | 前置     | 2    |
| 26   | co        | COP         | 哥伦比亚      | `COL$ 1.800.000,00` | `,`    | `.`    | 前置     | 2    |
| 27   | za        | ZAR         | 南非          | `R 7 700.00`        | `.`    | 空格   | 前置     | 2    |
| 28   | hk        | HKD         | 中国香港      | `HK$ 6,555.00`      | `.`    | `,`    | 前置     | 2    |
| 29   | tw        | TWD         | 中国台湾      | `NT$ 19,888.00`     | `.`    | `,`    | 前置     | 2    |
| 30   | sa        | SAR         | 沙特阿拉伯    | `1,800.00 SR`       | `.`    | `,`    | 后置     | 2    |
| 31   | ae        | AED         | 阿联酋        | `1,999.00 AED`      | `.`    | `,`    | 后置     | 2    |
| 32   | il        | ILS         | 以色列        | `₪2,500.00`         | `.`    | `,`    | 前置     | 2    |
| 33   | kz        | KZT         | 哈萨克斯坦    | `210 000,00₸`       | `,`    | 空格   | 后置     | 2    |
| 34   | kw        | KWD         | 科威特        | `135.00 KD`         | `.`    | 无     | 后置     | 2    |
| 35   | qa        | QAR         | 卡塔尔        | `1,800.00 QR`       | `.`    | `,`    | 后置     | 2    |
| 36   | cr        | CRC         | 哥斯达黎加    | `₡300.000,00`       | `,`    | `.`    | 前置     | 2    |
| 37   | uy        | UYU         | 乌拉圭        | `$U23.000,00`       | `,`    | `.`    | 前置     | 2    |
