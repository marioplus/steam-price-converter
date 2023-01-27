# steam-price-converter

一个 Tampermonkey 插件，能将 steam 商店和市场的的价格转换为某种货币展示。理论上支持所有区域。

## 使用

### 安装

脚本托管于 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/452504-steam%E4%BB%B7%E6%A0%BC%E8%BD%AC%E6%8D%A2)

### 更换转换货币

默认将价格转化为人名币，如果需要转换其他货币展示需要在控制台(F12)执行内置方法

![](https://s3.bmp.ovh/imgs/2023/01/18/b6ddbc484aba86a5.png)

刷新页面就能看到结果

![](https://s3.bmp.ovh/imgs/2023/01/18/2c9b9545580babf6.png)

#### 设置国家代码

可在[此处](https://github.com/marioplus/steam-price-converter/blob/master/src/countyCurrencyCodes.json)查看代码(文中的 code)

```js
SpcManager.setCountyCode('CN')
```

#### 设置货币符号

```js
SpcManager.setCurrencySymbol('￥')
```

#### 设置货币符号是否在前

```js
SpcManager.IsCurrencySymbolBeforeValue(true)
```

- true :在前
- false :在后

#### 重置设置

```js
ScpSettingManager.reset()
```

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

  ![澳大利亚](https://s3.bmp.ovh/imgs/2022/10/05/6984db4cf8803438.png)
