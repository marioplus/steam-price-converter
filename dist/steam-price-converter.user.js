// ==UserScript==
// @name         steam价格转换
// @namespace    https://github.com/marioplus/steam-price-converter
// @version      1.0.3
// @author       marioplus
// @description  steam商店中的价格转换为人民币
// @license      AGPL-3.0-or-later
// @icon         https://vitejs.dev/logo.svg
// @match        https://store.steampowered.com/*
// @match        https://steamcommunity.com/*
// @require      https://cdn.jsdelivr.net/npm/reflect-metadata@0.1.13/Reflect.min.js
// @require      https://cdn.jsdelivr.net/npm/loglevel@1.8.0/loglevel.min.js
// @connect      open.er-api.com
// @connect      store.steampowered.com
// @grant        GM_cookie
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(t=>{const e=document.createElement("style");e.dataset.source="vite-plugin-monkey",e.innerText=t,document.head.appendChild(e)})(".tab_item_discount{min-width:113px!important;width:unset}.discount_final_price{display:inline-block!important}.search_result_row .col.search_price{width:175px}.search_result_row .col.search_name{width:200px}.market_listing_their_price{width:160px}");

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function(log2) {
  var _a, _b;
  "use strict";
  const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
  const log__default = /* @__PURE__ */ _interopDefaultLegacy(log2);
  var r = (_a = Reflect.get(document, "__monkeyWindow")) != null ? _a : window;
  r.GM;
  r.unsafeWindow = (_b = r.unsafeWindow) != null ? _b : window;
  r.unsafeWindow;
  r.GM_info;
  var M = r.GM_cookie, u = (...e) => r.GM_setValue(...e), b = (...e) => r.GM_xmlhttpRequest(...e), h = (...e) => r.GM_getValue(...e);
  class AbstractConverter {
    match(elementSnap) {
      if (!elementSnap || !elementSnap.element) {
        return false;
      }
      const content = elementSnap.textContext;
      if (!content) {
        return false;
      }
      if (content.match(/\d/) === null) {
        return false;
      }
      if (/^[,.\d\s]+$/.test(content)) {
        return false;
      }
      const parent = elementSnap.element.parentElement;
      if (!parent) {
        return false;
      }
      for (const selector of this.getCssSelectors()) {
        const element = parent.querySelector(selector);
        if (element && element === elementSnap.element) {
          elementSnap.selector = selector;
          return true;
        }
      }
      return false;
    }
    afterConvert(elementSnap) {
    }
  }
  function parsePrice(content) {
    const matches = content.match(new RegExp("(?<=^\\D*)\\d+[\\d,.]*?(?=\\D*$)"));
    if (!matches) {
      throw Error("\u63D0\u53D6\u4EF7\u683C\u5931\u8D25\uFF1Acontent:" + content);
    }
    let priceStr = matches[0].replaceAll(/\D/g, "");
    let price = Number.parseInt(priceStr);
    if (matches[0].match(/\D\d\d$/)) {
      price = price / 100;
    }
    return price;
  }
  function convertPrice(price, rate) {
    return Number.parseFloat((price / rate).toFixed(2));
  }
  function convertPriceContent(originalContent, rate) {
    const safeContent = originalContent.trim().replaceAll(/\(.+$/g, "").trim();
    const price = parsePrice(safeContent);
    const convertedPrice = convertPrice(price, rate);
    const finalContent = `${safeContent}(\xA5${convertedPrice})`;
    log__default.default.debug(
      `\u8F6C\u6362\u524D\u6587\u672C  \uFF1A${safeContent}`,
      `\u63D0\u53D6\u5230\u7684\u4EF7\u683C\uFF1A${price}`,
      `\u8F6C\u6362\u540E\u7684\u4EF7\u683C\uFF1A${convertedPrice}`,
      `\u8F6C\u6362\u540E\u6587\u672C  \uFF1A${finalContent}`
    );
    return finalContent;
  }
  class ElementConverter extends AbstractConverter {
    getCssSelectors() {
      return [
        ".discount_original_price",
        ".discount_final_price",
        ".col.search_price.responsive_secondrow",
        "#header_wallet_balance > span.tooltip",
        ".esi-wishlist-stat > .num",
        ".salepreviewwidgets_StoreOriginalPrice_1EKGZ",
        ".salepreviewwidgets_StoreSalePriceBox_Wh0L8",
        ".game_purchase_price.price",
        ".contenthubshared_OriginalPrice_3hBh3",
        ".contenthubshared_FinalPrice_F_tGv",
        ".cart_item_price > div.price",
        "#cart_estimated_total",
        ".game_purchase_action_bg > .price",
        ".checkout_review_item_price > .price",
        "#review_subtotal_value.price",
        "#review_total_value.price",
        ".game_purchase_price.price",
        "#marketWalletBalanceAmount",
        "span.normal_price[data-price]",
        "span.sale_price",
        ".market_commodity_orders_header_promote:nth-child(even)",
        ".market_commodity_orders_table td:nth-child(odd)",
        ".market_table_value > span",
        ".jqplot-highlighter-tooltip"
      ];
    }
    convert(elementSnap, rate) {
      elementSnap.element.textContent = convertPriceContent(elementSnap.textContext, rate);
      return true;
    }
  }
  class TextNodeConverter extends AbstractConverter {
    constructor() {
      super(...arguments);
      __publicField(this, "targets", /* @__PURE__ */ new Map([
        [".col.search_price.responsive_secondrow", (el) => el.firstChild.nextSibling.nextSibling.nextSibling],
        ["#header_wallet_balance", (el) => el.firstChild]
      ]));
    }
    getCssSelectors() {
      return [...this.targets.keys()];
    }
    convert(elementSnap, rate) {
      const selector = elementSnap.selector;
      this.targets.get(selector);
      const parseNodeFn = this.targets.get(selector);
      if (!parseNodeFn) {
        return false;
      }
      const textNode = parseNodeFn(elementSnap.element);
      if (!textNode) {
        return false;
      }
      const content = textNode.nodeValue;
      if (!content) {
        return false;
      }
      textNode.nodeValue = convertPriceContent(content, rate);
      return true;
    }
  }
  const _ConverterManager = class {
    constructor() {
      __publicField(this, "converters");
      this.converters = [
        new ElementConverter(),
        new TextNodeConverter()
      ];
    }
    getSelector() {
      return this.converters.map((exchanger) => exchanger.getCssSelectors()).flat(1).join(", ");
    }
    convert(elements, rate) {
      if (!elements) {
        return;
      }
      elements.forEach((element) => {
        const elementSnap = {
          element,
          textContext: element.textContent,
          classList: element.classList,
          attributes: element.attributes
        };
        this.converters.filter((converter) => converter.match(elementSnap)).forEach((converter) => {
          try {
            const exchanged = converter.convert(elementSnap, rate);
            if (exchanged) {
              converter.afterConvert(elementSnap);
            }
          } catch (e) {
            console.group("\u8F6C\u6362\u5931\u8D25");
            log__default.default.error(e);
            log__default.default.error("\u8F6C\u6362\u5931\u8D25\u8BF7\u5C06\u4E0B\u5217\u5185\u5BB9\u53CD\u9988\u7ED9\u5F00\u53D1\u8005\uFF0C\u53F3\u952E > \u590D\u5236(copy) > \u590D\u5236\u5143\u7D20(copy element)");
            log__default.default.error("\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193\u2193");
            log__default.default.error(element);
            log__default.default.error("\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191\u2191");
            console.groupEnd();
          }
        });
      });
    }
  };
  let ConverterManager = _ConverterManager;
  __publicField(ConverterManager, "instance", new _ConverterManager());
  const countyCurrencyCodes = [
    {
      code: "AL",
      name: "\u963F\u5C14\u5DF4\u5C3C\u4E9A",
      nameEn: "Albania",
      currencyCode: "ALL"
    },
    {
      code: "DZ",
      name: "\u963F\u5C14\u53CA\u5229\u4E9A",
      nameEn: "Algeria",
      currencyCode: "DZD"
    },
    {
      code: "AF",
      name: "\u963F\u5BCC\u6C57",
      nameEn: "Afghanistan",
      currencyCode: "AFN"
    },
    {
      code: "AR",
      name: "\u963F\u6839\u5EF7",
      nameEn: "Argentina",
      currencyCode: "ARS"
    },
    {
      code: "AE",
      name: "\u963F\u8054\u914B",
      nameEn: "United Arab Emirates",
      currencyCode: "AED"
    },
    {
      code: "AW",
      name: "\u963F\u9C81\u5DF4",
      nameEn: "Aruba",
      currencyCode: "AWG"
    },
    {
      code: "OM",
      name: "\u963F\u66FC",
      nameEn: "Oman",
      currencyCode: "OMR"
    },
    {
      code: "AZ",
      name: "\u963F\u585E\u62DC\u7586",
      nameEn: "Azerbaijan",
      currencyCode: "AZN"
    },
    {
      code: "EG",
      name: "\u57C3\u53CA",
      nameEn: "Egypt",
      currencyCode: "EGP"
    },
    {
      code: "ET",
      name: "\u57C3\u585E\u4FC4\u6BD4\u4E9A",
      nameEn: "Ethiopia",
      currencyCode: "ETB"
    },
    {
      code: "IE",
      name: "\u7231\u5C14\u5170",
      nameEn: "Ireland",
      currencyCode: "EUR"
    },
    {
      code: "EE",
      name: "\u7231\u6C99\u5C3C\u4E9A",
      nameEn: "Estonia",
      currencyCode: "EUR"
    },
    {
      code: "AD",
      name: "\u5B89\u9053\u5C14",
      nameEn: "Andorra",
      currencyCode: "EUR"
    },
    {
      code: "AO",
      name: "\u5B89\u54E5\u62C9",
      nameEn: "Angola",
      currencyCode: "AOA"
    },
    {
      code: "AI",
      name: "\u5B89\u572D\u62C9",
      nameEn: "Anguilla",
      currencyCode: "XCD"
    },
    {
      code: "AG",
      name: "\u5B89\u63D0\u74DC\u548C\u5DF4\u5E03\u8FBE",
      nameEn: "Antigua and Barbuda",
      currencyCode: "XCD"
    },
    {
      code: "AT",
      name: "\u5965\u5730\u5229",
      nameEn: "Austria",
      currencyCode: "EUR"
    },
    {
      code: "AU",
      name: "\u6FB3\u5927\u5229\u4E9A",
      nameEn: "Australia",
      currencyCode: "AUD"
    },
    {
      code: "MO",
      name: "\u6FB3\u95E8",
      nameEn: "Macao",
      currencyCode: "MOP"
    },
    {
      code: "BB",
      name: "\u5DF4\u5DF4\u591A\u65AF",
      nameEn: "Barbados",
      currencyCode: "BBD"
    },
    {
      code: "PG",
      name: "\u5DF4\u5E03\u4E9A\u65B0\u51E0\u5185\u4E9A",
      nameEn: "Papua New Guinea",
      currencyCode: "PGK"
    },
    {
      code: "BS",
      name: "\u5DF4\u54C8\u9A6C",
      nameEn: "Bahamas",
      currencyCode: "BSD"
    },
    {
      code: "PK",
      name: "\u5DF4\u57FA\u65AF\u5766",
      nameEn: "Pakistan",
      currencyCode: "PKR"
    },
    {
      code: "PY",
      name: "\u5DF4\u62C9\u572D",
      nameEn: "Paraguay",
      currencyCode: "PYG"
    },
    {
      code: "PS",
      name: "\u5DF4\u52D2\u65AF\u5766",
      nameEn: "Palestine, State of",
      currencyCode: "ILS"
    },
    {
      code: "BH",
      name: "\u5DF4\u6797",
      nameEn: "Bahrain",
      currencyCode: "BHD"
    },
    {
      code: "PA",
      name: "\u5DF4\u62FF\u9A6C",
      nameEn: "Panama",
      currencyCode: "PAB"
    },
    {
      code: "BR",
      name: "\u5DF4\u897F",
      nameEn: "Brazil",
      currencyCode: "BRL"
    },
    {
      code: "BY",
      name: "\u767D\u4FC4\u7F57\u65AF",
      nameEn: "Belarus",
      currencyCode: "BYN"
    },
    {
      code: "BM",
      name: "\u767E\u6155\u5927",
      nameEn: "Bermuda",
      currencyCode: "BMD"
    },
    {
      code: "BG",
      name: "\u4FDD\u52A0\u5229\u4E9A",
      nameEn: "Bulgaria",
      currencyCode: "BGN"
    },
    {
      code: "MP",
      name: "\u5317\u9A6C\u91CC\u4E9A\u7EB3\u7FA4\u5C9B",
      nameEn: "Northern Mariana Islands",
      currencyCode: "USD"
    },
    {
      code: "BJ",
      name: "\u8D1D\u5B81",
      nameEn: "Benin",
      currencyCode: "XOF"
    },
    {
      code: "BE",
      name: "\u6BD4\u5229\u65F6",
      nameEn: "Belgium",
      currencyCode: "EUR"
    },
    {
      code: "IS",
      name: "\u51B0\u5C9B",
      nameEn: "Iceland",
      currencyCode: "ISK"
    },
    {
      code: "PR",
      name: "\u6CE2\u591A\u9ECE\u5404",
      nameEn: "Puerto Rico",
      currencyCode: "USD"
    },
    {
      code: "BA",
      name: "\u6CE2\u9ED1",
      nameEn: "Bosnia and Herzegovina",
      currencyCode: "BAM"
    },
    {
      code: "PL",
      name: "\u6CE2\u5170",
      nameEn: "Poland",
      currencyCode: "PLN"
    },
    {
      code: "BO",
      name: "\u73BB\u5229\u7EF4\u4E9A",
      nameEn: "Bolivia, Plurinational State of",
      currencyCode: "BOB"
    },
    {
      code: "BZ",
      name: "\u4F2F\u5229\u5179",
      nameEn: "Belize",
      currencyCode: "BZD"
    },
    {
      code: "BW",
      name: "\u535A\u8328\u74E6\u7EB3",
      nameEn: "Botswana",
      currencyCode: "BWP"
    },
    {
      code: "BT",
      name: "\u4E0D\u4E39",
      nameEn: "Bhutan",
      currencyCode: "BTN"
    },
    {
      code: "BF",
      name: "\u5E03\u57FA\u7EB3\u6CD5\u7D22",
      nameEn: "Burkina Faso",
      currencyCode: "XOF"
    },
    {
      code: "BI",
      name: "\u5E03\u9686\u8FEA",
      nameEn: "Burundi",
      currencyCode: "BIF"
    },
    {
      code: "BV",
      name: "\u5E03\u97E6\u5C9B",
      nameEn: "Bouvet Island",
      currencyCode: "NOK"
    },
    {
      code: "KP",
      name: "\u671D\u9C9C",
      nameEn: "Korea, Democratic People's Republic of",
      currencyCode: "KPW"
    },
    {
      code: "GQ",
      name: "\u8D64\u9053\u51E0\u5185\u4E9A",
      nameEn: "Equatorial Guinea",
      currencyCode: "XAF"
    },
    {
      code: "DK",
      name: "\u4E39\u9EA6",
      nameEn: "Denmark",
      currencyCode: "DKK"
    },
    {
      code: "DE",
      name: "\u5FB7\u56FD",
      nameEn: "Germany",
      currencyCode: "EUR"
    },
    {
      code: "TL",
      name: "\u4E1C\u5E1D\u6C76",
      nameEn: "Timor-Leste",
      currencyCode: "USD"
    },
    {
      code: "TG",
      name: "\u591A\u54E5",
      nameEn: "Togo",
      currencyCode: "XOF"
    },
    {
      code: "DO",
      name: "\u591A\u7C73\u5C3C\u52A0",
      nameEn: "Dominican Republic",
      currencyCode: "DOP"
    },
    {
      code: "DM",
      name: "\u591A\u7C73\u5C3C\u514B",
      nameEn: "Dominica",
      currencyCode: "XCD"
    },
    {
      code: "RU",
      name: "\u4FC4\u7F57\u65AF",
      nameEn: "Russian Federation",
      currencyCode: "RUB"
    },
    {
      code: "EC",
      name: "\u5384\u74DC\u591A\u5C14",
      nameEn: "Ecuador",
      currencyCode: "USD"
    },
    {
      code: "ER",
      name: "\u5384\u7ACB\u7279\u91CC\u4E9A",
      nameEn: "Eritrea",
      currencyCode: "ERN"
    },
    {
      code: "FR",
      name: "\u6CD5\u56FD",
      nameEn: "France",
      currencyCode: "EUR"
    },
    {
      code: "FO",
      name: "\u6CD5\u7F57\u7FA4\u5C9B",
      nameEn: "Faroe Islands",
      currencyCode: "DKK"
    },
    {
      code: "PF",
      name: "\u6CD5\u5C5E\u6CE2\u5229\u5C3C\u897F\u4E9A",
      nameEn: "French Polynesia",
      currencyCode: "XPF"
    },
    {
      code: "VA",
      name: "\u68B5\u8482\u5188",
      nameEn: "Holy See",
      currencyCode: "EUR"
    },
    {
      code: "PH",
      name: "\u83F2\u5F8B\u5BBE",
      nameEn: "Philippines",
      currencyCode: "PHP"
    },
    {
      code: "FJ",
      name: "\u6590\u6D4E",
      nameEn: "Fiji",
      currencyCode: "FJD"
    },
    {
      code: "FI",
      name: "\u82AC\u5170",
      nameEn: "Finland",
      currencyCode: "EUR"
    },
    {
      code: "CV",
      name: "\u4F5B\u5F97\u89D2",
      nameEn: "Cabo Verde",
      currencyCode: "CVE"
    },
    {
      code: "FK",
      name: "\u798F\u514B\u5170\u7FA4\u5C9B",
      nameEn: "Falkland Islands (Malvinas)",
      currencyCode: "FKP"
    },
    {
      code: "GM",
      name: "\u5188\u6BD4\u4E9A",
      nameEn: "Gambia",
      currencyCode: "GMD"
    },
    {
      code: "CG",
      name: "\u521A\u679C\u5171\u548C\u56FD",
      nameEn: "Congo",
      currencyCode: "XAF"
    },
    {
      code: "CD",
      name: "\u521A\u679C\u6C11\u4E3B\u5171\u548C\u56FD",
      nameEn: "Congo, the Democratic Republic of the",
      currencyCode: "CDF"
    },
    {
      code: "CO",
      name: "\u54E5\u4F26\u6BD4\u4E9A",
      nameEn: "Colombia",
      currencyCode: "COP"
    },
    {
      code: "CR",
      name: "\u54E5\u65AF\u8FBE\u9ECE\u52A0",
      nameEn: "Costa Rica",
      currencyCode: "CRC"
    },
    {
      code: "GD",
      name: "\u683C\u6797\u7EB3\u8FBE",
      nameEn: "Grenada",
      currencyCode: "XCD"
    },
    {
      code: "GL",
      name: "\u683C\u9675\u5170",
      nameEn: "Greenland",
      currencyCode: "DKK"
    },
    {
      code: "GE",
      name: "\u683C\u9C81\u5409\u4E9A",
      nameEn: "Georgia",
      currencyCode: "GEL"
    },
    {
      code: "GG",
      name: "\u6839\u897F",
      nameEn: "Guernsey",
      currencyCode: "GBP"
    },
    {
      code: "CU",
      name: "\u53E4\u5DF4",
      nameEn: "Cuba",
      currencyCode: "CUP"
    },
    {
      code: "GP",
      name: "\u74DC\u5FB7\u7F57\u666E",
      nameEn: "Guadeloupe",
      currencyCode: "EUR"
    },
    {
      code: "GU",
      name: "\u5173\u5C9B",
      nameEn: "Guam",
      currencyCode: "USD"
    },
    {
      code: "GY",
      name: "\u572D\u4E9A\u90A3",
      nameEn: "Guyana",
      currencyCode: "GYD"
    },
    {
      code: "KZ",
      name: "\u54C8\u8428\u514B\u65AF\u5766",
      nameEn: "Kazakhstan",
      currencyCode: "KZT"
    },
    {
      code: "HT",
      name: "\u6D77\u5730",
      nameEn: "Haiti",
      currencyCode: "HTG"
    },
    {
      code: "KR",
      name: "\u97E9\u56FD",
      nameEn: "Korea, Republic of",
      currencyCode: "KRW"
    },
    {
      code: "NL",
      name: "\u8377\u5170",
      nameEn: "Netherlands",
      currencyCode: "EUR"
    },
    {
      code: "SX",
      name: "\u8377\u5C5E\u5723\u9A6C\u4E01",
      nameEn: "Sint Maarten (Dutch part)",
      currencyCode: "ANG"
    },
    {
      code: "HM",
      name: "\u8D6B\u5FB7\u5C9B\u548C\u9EA6\u514B\u5510\u7EB3\u7FA4\u5C9B",
      nameEn: "Heard Island and McDonald Islands",
      currencyCode: "AUD"
    },
    {
      code: "ME",
      name: "\u9ED1\u5C71",
      nameEn: "Montenegro",
      currencyCode: "EUR"
    },
    {
      code: "HN",
      name: "\u6D2A\u90FD\u62C9\u65AF",
      nameEn: "Honduras",
      currencyCode: "HNL"
    },
    {
      code: "KI",
      name: "\u57FA\u91CC\u5DF4\u65AF",
      nameEn: "Kiribati",
      currencyCode: "AUD"
    },
    {
      code: "DJ",
      name: "\u5409\u5E03\u63D0",
      nameEn: "Djibouti",
      currencyCode: "DJF"
    },
    {
      code: "KG",
      name: "\u5409\u5C14\u5409\u65AF\u65AF\u5766",
      nameEn: "Kyrgyzstan",
      currencyCode: "KGS"
    },
    {
      code: "GN",
      name: "\u51E0\u5185\u4E9A",
      nameEn: "Guinea",
      currencyCode: "GNF"
    },
    {
      code: "GW",
      name: "\u51E0\u5185\u4E9A\u6BD4\u7ECD",
      nameEn: "Guinea-Bissau",
      currencyCode: "XOF"
    },
    {
      code: "CA",
      name: "\u52A0\u62FF\u5927",
      nameEn: "Canada",
      currencyCode: "CAD"
    },
    {
      code: "GH",
      name: "\u52A0\u7EB3",
      nameEn: "Ghana",
      currencyCode: "GHS"
    },
    {
      code: "GA",
      name: "\u52A0\u84EC",
      nameEn: "Gabon",
      currencyCode: "XAF"
    },
    {
      code: "KH",
      name: "\u67EC\u57D4\u5BE8",
      nameEn: "Cambodia",
      currencyCode: "KHR"
    },
    {
      code: "CZ",
      name: "\u6377\u514B",
      nameEn: "Czechia",
      currencyCode: "CZK"
    },
    {
      code: "ZW",
      name: "\u6D25\u5DF4\u5E03\u97E6",
      nameEn: "Zimbabwe",
      currencyCode: "ZWL"
    },
    {
      code: "CM",
      name: "\u5580\u9EA6\u9686",
      nameEn: "Cameroon",
      currencyCode: "XAF"
    },
    {
      code: "QA",
      name: "\u5361\u5854\u5C14",
      nameEn: "Qatar",
      currencyCode: "QAR"
    },
    {
      code: "KY",
      name: "\u5F00\u66FC\u7FA4\u5C9B",
      nameEn: "Cayman Islands",
      currencyCode: "KYD"
    },
    {
      code: "CC",
      name: "\u79D1\u79D1\u65AF\uFF08\u57FA\u6797\uFF09\u7FA4\u5C9B",
      nameEn: "Cocos (Keeling) Islands",
      currencyCode: "AUD"
    },
    {
      code: "KM",
      name: "\u79D1\u6469\u7F57",
      nameEn: "Comoros",
      currencyCode: "KMF"
    },
    {
      code: "CI",
      name: "\u79D1\u7279\u8FEA\u74E6",
      nameEn: "C\xF4te d'Ivoire",
      currencyCode: "XOF"
    },
    {
      code: "KW",
      name: "\u79D1\u5A01\u7279",
      nameEn: "Kuwait",
      currencyCode: "KWD"
    },
    {
      code: "HR",
      name: "\u514B\u7F57\u5730\u4E9A",
      nameEn: "Croatia",
      currencyCode: "HRK"
    },
    {
      code: "KE",
      name: "\u80AF\u5C3C\u4E9A",
      nameEn: "Kenya",
      currencyCode: "KES"
    },
    {
      code: "CK",
      name: "\u5E93\u514B\u7FA4\u5C9B",
      nameEn: "Cook Islands",
      currencyCode: "NZD"
    },
    {
      code: "CW",
      name: "\u5E93\u62C9\u7D22",
      nameEn: "Cura\xE7ao",
      currencyCode: "ANG"
    },
    {
      code: "LV",
      name: "\u62C9\u8131\u7EF4\u4E9A",
      nameEn: "Latvia",
      currencyCode: "EUR"
    },
    {
      code: "LS",
      name: "\u83B1\u7D22\u6258",
      nameEn: "Lesotho",
      currencyCode: "LSL"
    },
    {
      code: "LA",
      name: "\u8001\u631D",
      nameEn: "Lao People's Democratic Republic",
      currencyCode: "LAK"
    },
    {
      code: "LB",
      name: "\u9ECE\u5DF4\u5AE9",
      nameEn: "Lebanon",
      currencyCode: "LBP"
    },
    {
      code: "LT",
      name: "\u7ACB\u9676\u5B9B",
      nameEn: "Lithuania",
      currencyCode: "EUR"
    },
    {
      code: "LR",
      name: "\u5229\u6BD4\u91CC\u4E9A",
      nameEn: "Liberia",
      currencyCode: "LRD"
    },
    {
      code: "LY",
      name: "\u5229\u6BD4\u4E9A",
      nameEn: "Libya",
      currencyCode: "LYD"
    },
    {
      code: "LI",
      name: "\u5217\u652F\u6566\u58EB\u767B",
      nameEn: "Liechtenstein",
      currencyCode: "CHF"
    },
    {
      code: "RE",
      name: "\u7559\u5C3C\u6C6A",
      nameEn: "R\xE9union",
      currencyCode: "EUR"
    },
    {
      code: "LU",
      name: "\u5362\u68EE\u5821",
      nameEn: "Luxembourg",
      currencyCode: "EUR"
    },
    {
      code: "RW",
      name: "\u5362\u65FA\u8FBE",
      nameEn: "Rwanda",
      currencyCode: "RWF"
    },
    {
      code: "RO",
      name: "\u7F57\u9A6C\u5C3C\u4E9A",
      nameEn: "Romania",
      currencyCode: "RON"
    },
    {
      code: "MG",
      name: "\u9A6C\u8FBE\u52A0\u65AF\u52A0",
      nameEn: "Madagascar",
      currencyCode: "MGA"
    },
    {
      code: "IM",
      name: "\u9A6C\u6069\u5C9B",
      nameEn: "Isle of Man",
      currencyCode: "GBP"
    },
    {
      code: "MV",
      name: "\u9A6C\u5C14\u4EE3\u592B",
      nameEn: "Maldives",
      currencyCode: "MVR"
    },
    {
      code: "MT",
      name: "\u9A6C\u8033\u4ED6",
      nameEn: "Malta",
      currencyCode: "EUR"
    },
    {
      code: "MW",
      name: "\u9A6C\u62C9\u7EF4",
      nameEn: "Malawi",
      currencyCode: "MWK"
    },
    {
      code: "MY",
      name: "\u9A6C\u6765\u897F\u4E9A",
      nameEn: "Malaysia",
      currencyCode: "MYR"
    },
    {
      code: "ML",
      name: "\u9A6C\u91CC",
      nameEn: "Mali",
      currencyCode: "XOF"
    },
    {
      code: "MH",
      name: "\u9A6C\u7ECD\u5C14\u7FA4\u5C9B",
      nameEn: "Marshall Islands",
      currencyCode: "USD"
    },
    {
      code: "MQ",
      name: "\u9A6C\u63D0\u5C3C\u514B",
      nameEn: "Martinique",
      currencyCode: "EUR"
    },
    {
      code: "YT",
      name: "\u9A6C\u7EA6\u7279",
      nameEn: "Mayotte",
      currencyCode: "EUR"
    },
    {
      code: "MU",
      name: "\u6BDB\u91CC\u6C42\u65AF",
      nameEn: "Mauritius",
      currencyCode: "MUR"
    },
    {
      code: "MR",
      name: "\u6BDB\u91CC\u5854\u5C3C\u4E9A",
      nameEn: "Mauritania",
      currencyCode: "MRU"
    },
    {
      code: "US",
      name: "\u7F8E\u56FD",
      nameEn: "United States of America",
      currencyCode: "USD"
    },
    {
      code: "AS",
      name: "\u7F8E\u5C5E\u8428\u6469\u4E9A",
      nameEn: "American Samoa",
      currencyCode: "USD"
    },
    {
      code: "VI",
      name: "\u7F8E\u5C5E\u7EF4\u5C14\u4EAC\u7FA4\u5C9B",
      nameEn: "Virgin Islands, U.S.",
      currencyCode: "USD"
    },
    {
      code: "MN",
      name: "\u8499\u53E4",
      nameEn: "Mongolia",
      currencyCode: "MNT"
    },
    {
      code: "MS",
      name: "\u8499\u7279\u585E\u62C9\u7279",
      nameEn: "Montserrat",
      currencyCode: "XCD"
    },
    {
      code: "BD",
      name: "\u5B5F\u52A0\u62C9\u56FD",
      nameEn: "Bangladesh",
      currencyCode: "BDT"
    },
    {
      code: "PE",
      name: "\u79D8\u9C81",
      nameEn: "Peru",
      currencyCode: "PEN"
    },
    {
      code: "FM",
      name: "\u5BC6\u514B\u7F57\u5C3C\u897F\u4E9A\u8054\u90A6",
      nameEn: "Micronesia, Federated States of",
      currencyCode: "USD"
    },
    {
      code: "MM",
      name: "\u7F05\u7538",
      nameEn: "Myanmar",
      currencyCode: "MMK"
    },
    {
      code: "MD",
      name: "\u6469\u5C14\u591A\u74E6",
      nameEn: "Moldova, Republic of",
      currencyCode: "MDL"
    },
    {
      code: "MA",
      name: "\u6469\u6D1B\u54E5",
      nameEn: "Morocco",
      currencyCode: "MAD"
    },
    {
      code: "MC",
      name: "\u6469\u7EB3\u54E5",
      nameEn: "Monaco",
      currencyCode: "EUR"
    },
    {
      code: "MZ",
      name: "\u83AB\u6851\u6BD4\u514B",
      nameEn: "Mozambique",
      currencyCode: "MZN"
    },
    {
      code: "MX",
      name: "\u58A8\u897F\u54E5",
      nameEn: "Mexico",
      currencyCode: "MXN"
    },
    {
      code: "NA",
      name: "\u7EB3\u7C73\u6BD4\u4E9A",
      nameEn: "Namibia",
      currencyCode: "NAD"
    },
    {
      code: "ZA",
      name: "\u5357\u975E",
      nameEn: "South Africa",
      currencyCode: "ZAR"
    },
    {
      code: "GS",
      name: "\u5357\u4E54\u6CBB\u4E9A\u548C\u5357\u6851\u5A01\u5947\u7FA4\u5C9B",
      nameEn: "South Georgia and the South Sandwich Islands",
      currencyCode: "GBP"
    },
    {
      code: "SS",
      name: "\u5357\u82CF\u4E39",
      nameEn: "South Sudan",
      currencyCode: "SSP"
    },
    {
      code: "NR",
      name: "\u7459\u9C81",
      nameEn: "Nauru",
      currencyCode: "AUD"
    },
    {
      code: "NI",
      name: "\u5C3C\u52A0\u62C9\u74DC",
      nameEn: "Nicaragua",
      currencyCode: "NIO"
    },
    {
      code: "NP",
      name: "\u5C3C\u6CCA\u5C14",
      nameEn: "Nepal",
      currencyCode: "NPR"
    },
    {
      code: "NG",
      name: "\u5C3C\u65E5\u5229\u4E9A",
      nameEn: "Nigeria",
      currencyCode: "NGN"
    },
    {
      code: "NU",
      name: "\u7EBD\u57C3",
      nameEn: "Niue",
      currencyCode: "NZD"
    },
    {
      code: "NO",
      name: "\u632A\u5A01",
      nameEn: "Norway",
      currencyCode: "NOK"
    },
    {
      code: "NF",
      name: "\u8BFA\u798F\u514B\u5C9B",
      nameEn: "Norfolk Island",
      currencyCode: "AUD"
    },
    {
      code: "PW",
      name: "\u5E15\u52B3",
      nameEn: "Palau",
      currencyCode: "USD"
    },
    {
      code: "PN",
      name: "\u76AE\u7279\u51EF\u6069\u7FA4\u5C9B",
      nameEn: "Pitcairn",
      currencyCode: "NZD"
    },
    {
      code: "PT",
      name: "\u8461\u8404\u7259",
      nameEn: "Portugal",
      currencyCode: "EUR"
    },
    {
      code: "JP",
      name: "\u65E5\u672C",
      nameEn: "Japan",
      currencyCode: "JPY"
    },
    {
      code: "SE",
      name: "\u745E\u5178",
      nameEn: "Sweden",
      currencyCode: "SEK"
    },
    {
      code: "CH",
      name: "\u745E\u58EB",
      nameEn: "Switzerland",
      currencyCode: "CHF"
    },
    {
      code: "SV",
      name: "\u8428\u5C14\u74E6\u591A",
      nameEn: "El Salvador",
      currencyCode: "USD"
    },
    {
      code: "WS",
      name: "\u8428\u6469\u4E9A",
      nameEn: "Samoa",
      currencyCode: "WST"
    },
    {
      code: "RS",
      name: "\u585E\u5C14\u7EF4\u4E9A",
      nameEn: "Serbia",
      currencyCode: "RSD"
    },
    {
      code: "SL",
      name: "\u585E\u62C9\u5229\u6602",
      nameEn: "Sierra Leone",
      currencyCode: "SLL"
    },
    {
      code: "SN",
      name: "\u585E\u5185\u52A0\u5C14",
      nameEn: "Senegal",
      currencyCode: "XOF"
    },
    {
      code: "CY",
      name: "\u585E\u6D66\u8DEF\u65AF",
      nameEn: "Cyprus",
      currencyCode: "EUR"
    },
    {
      code: "SC",
      name: "\u585E\u820C\u5C14",
      nameEn: "Seychelles",
      currencyCode: "SCR"
    },
    {
      code: "SA",
      name: "\u6C99\u7279\u963F\u62C9\u4F2F",
      nameEn: "Saudi Arabia",
      currencyCode: "SAR"
    },
    {
      code: "BL",
      name: "\u5723\u5DF4\u6CF0\u52D2\u7C73",
      nameEn: "Saint Barth\xE9lemy",
      currencyCode: "EUR"
    },
    {
      code: "CX",
      name: "\u5723\u8BDE\u5C9B",
      nameEn: "Christmas Island",
      currencyCode: "AUD"
    },
    {
      code: "ST",
      name: "\u5723\u591A\u7F8E\u548C\u666E\u6797\u897F\u6BD4",
      nameEn: "Sao Tome and Principe",
      currencyCode: "STN"
    },
    {
      code: "SH",
      name: "\u5723\u8D6B\u52D2\u62FF\u3001\u963F\u68EE\u677E\u548C\u7279\u91CC\u65AF\u5766-\u8FBE\u5E93\u5C3C\u4E9A",
      nameEn: "Saint Helena, Ascension and Tristan da Cunha",
      currencyCode: "SHP"
    },
    {
      code: "KN",
      name: "\u5723\u57FA\u8328\u548C\u5C3C\u7EF4\u65AF",
      nameEn: "Saint Kitts and Nevis",
      currencyCode: "XCD"
    },
    {
      code: "LC",
      name: "\u5723\u5362\u897F\u4E9A",
      nameEn: "Saint Lucia",
      currencyCode: "XCD"
    },
    {
      code: "SM",
      name: "\u5723\u9A6C\u529B\u8BFA",
      nameEn: "San Marino",
      currencyCode: "EUR"
    },
    {
      code: "PM",
      name: "\u5723\u76AE\u57C3\u5C14\u548C\u5BC6\u514B\u9686",
      nameEn: "Saint Pierre and Miquelon",
      currencyCode: "EUR"
    },
    {
      code: "VC",
      name: "\u5723\u6587\u68EE\u7279\u548C\u683C\u6797\u7EB3\u4E01\u65AF",
      nameEn: "Saint Vincent and the Grenadines",
      currencyCode: "XCD"
    },
    {
      code: "LK",
      name: "\u65AF\u91CC\u5170\u5361",
      nameEn: "Sri Lanka",
      currencyCode: "LKR"
    },
    {
      code: "SK",
      name: "\u65AF\u6D1B\u4F10\u514B",
      nameEn: "Slovakia",
      currencyCode: "EUR"
    },
    {
      code: "SI",
      name: "\u65AF\u6D1B\u6587\u5C3C\u4E9A",
      nameEn: "Slovenia",
      currencyCode: "EUR"
    },
    {
      code: "SJ",
      name: "\u65AF\u74E6\u5C14\u5DF4\u548C\u626C\u9A6C\u5EF6",
      nameEn: "Svalbard and Jan Mayen",
      currencyCode: "NOK"
    },
    {
      code: "SZ",
      name: "\u65AF\u5A01\u58EB\u5170",
      nameEn: "Eswatini",
      currencyCode: "SZL"
    },
    {
      code: "SD",
      name: "\u82CF\u4E39",
      nameEn: "Sudan",
      currencyCode: "SDG"
    },
    {
      code: "SR",
      name: "\u82CF\u91CC\u5357",
      nameEn: "Suriname",
      currencyCode: "SRD"
    },
    {
      code: "SB",
      name: "\u6240\u7F57\u95E8\u7FA4\u5C9B",
      nameEn: "Solomon Islands",
      currencyCode: "SBD"
    },
    {
      code: "SO",
      name: "\u7D22\u9A6C\u91CC",
      nameEn: "Somalia",
      currencyCode: "SOS"
    },
    {
      code: "TJ",
      name: "\u5854\u5409\u514B\u65AF\u5766",
      nameEn: "Tajikistan",
      currencyCode: "TJS"
    },
    {
      code: "TH",
      name: "\u6CF0\u56FD",
      nameEn: "Thailand",
      currencyCode: "THB"
    },
    {
      code: "TZ",
      name: "\u5766\u6851\u5C3C\u4E9A",
      nameEn: "Tanzania, United Republic of",
      currencyCode: "TZS"
    },
    {
      code: "TO",
      name: "\u6C64\u52A0",
      nameEn: "Tonga",
      currencyCode: "TOP"
    },
    {
      code: "TC",
      name: "\u7279\u514B\u65AF\u548C\u51EF\u79D1\u65AF\u7FA4\u5C9B",
      nameEn: "Turks and Caicos Islands",
      currencyCode: "USD"
    },
    {
      code: "TT",
      name: "\u7279\u7ACB\u5C3C\u8FBE\u548C\u591A\u5DF4\u54E5",
      nameEn: "Trinidad and Tobago",
      currencyCode: "TTD"
    },
    {
      code: "TN",
      name: "\u7A81\u5C3C\u65AF",
      nameEn: "Tunisia",
      currencyCode: "TND"
    },
    {
      code: "TV",
      name: "\u56FE\u74E6\u5362",
      nameEn: "Tuvalu",
      currencyCode: "AUD"
    },
    {
      code: "TR",
      name: "\u571F\u8033\u5176",
      nameEn: "Turkey",
      currencyCode: "TRY"
    },
    {
      code: "TM",
      name: "\u571F\u5E93\u66FC\u65AF\u5766",
      nameEn: "Turkmenistan",
      currencyCode: "TMT"
    },
    {
      code: "TK",
      name: "\u6258\u514B\u52B3",
      nameEn: "Tokelau",
      currencyCode: "NZD"
    },
    {
      code: "WF",
      name: "\u74E6\u5229\u65AF\u548C\u5BCC\u56FE\u7EB3",
      nameEn: "Wallis and Futuna",
      currencyCode: "XPF"
    },
    {
      code: "VU",
      name: "\u74E6\u52AA\u963F\u56FE",
      nameEn: "Vanuatu",
      currencyCode: "VUV"
    },
    {
      code: "GT",
      name: "\u5371\u5730\u9A6C\u62C9",
      nameEn: "Guatemala",
      currencyCode: "GTQ"
    },
    {
      code: "VE",
      name: "\u59D4\u5185\u745E\u62C9",
      nameEn: "Venezuela, Bolivarian Republic of",
      currencyCode: "VES"
    },
    {
      code: "BN",
      name: "\u6587\u83B1",
      nameEn: "Brunei Darussalam",
      currencyCode: "BND"
    },
    {
      code: "UG",
      name: "\u4E4C\u5E72\u8FBE",
      nameEn: "Uganda",
      currencyCode: "UGX"
    },
    {
      code: "UA",
      name: "\u4E4C\u514B\u5170",
      nameEn: "Ukraine",
      currencyCode: "UAH"
    },
    {
      code: "UY",
      name: "\u4E4C\u62C9\u572D",
      nameEn: "Uruguay",
      currencyCode: "UYU"
    },
    {
      code: "UZ",
      name: "\u4E4C\u5179\u522B\u514B\u65AF\u5766",
      nameEn: "Uzbekistan",
      currencyCode: "UZS"
    },
    {
      code: "ES",
      name: "\u897F\u73ED\u7259",
      nameEn: "Spain",
      currencyCode: "EUR"
    },
    {
      code: "GR",
      name: "\u5E0C\u814A",
      nameEn: "Greece",
      currencyCode: "EUR"
    },
    {
      code: "SG",
      name: "\u65B0\u52A0\u5761",
      nameEn: "Singapore",
      currencyCode: "SGD"
    },
    {
      code: "NC",
      name: "\u65B0\u5580\u91CC\u591A\u5C3C\u4E9A",
      nameEn: "New Caledonia",
      currencyCode: "XPF"
    },
    {
      code: "NZ",
      name: "\u65B0\u897F\u5170",
      nameEn: "New Zealand",
      currencyCode: "NZD"
    },
    {
      code: "HU",
      name: "\u5308\u7259\u5229",
      nameEn: "Hungary",
      currencyCode: "HUF"
    },
    {
      code: "SY",
      name: "\u53D9\u5229\u4E9A",
      nameEn: "Syrian Arab Republic",
      currencyCode: "SYP"
    },
    {
      code: "JM",
      name: "\u7259\u4E70\u52A0",
      nameEn: "Jamaica",
      currencyCode: "JMD"
    },
    {
      code: "AM",
      name: "\u4E9A\u7F8E\u5C3C\u4E9A",
      nameEn: "Armenia",
      currencyCode: "AMD"
    },
    {
      code: "YE",
      name: "\u4E5F\u95E8",
      nameEn: "Yemen",
      currencyCode: "YER"
    },
    {
      code: "IQ",
      name: "\u4F0A\u62C9\u514B",
      nameEn: "Iraq",
      currencyCode: "IQD"
    },
    {
      code: "IR",
      name: "\u4F0A\u6717",
      nameEn: "Iran, Islamic Republic of",
      currencyCode: "IRR"
    },
    {
      code: "IL",
      name: "\u4EE5\u8272\u5217",
      nameEn: "Israel",
      currencyCode: "ILS"
    },
    {
      code: "IT",
      name: "\u610F\u5927\u5229",
      nameEn: "Italy",
      currencyCode: "EUR"
    },
    {
      code: "IN",
      name: "\u5370\u5EA6",
      nameEn: "India",
      currencyCode: "INR"
    },
    {
      code: "ID",
      name: "\u5370\u5EA6\u5C3C\u897F\u4E9A",
      nameEn: "Indonesia",
      currencyCode: "IDR"
    },
    {
      code: "GB",
      name: "\u82F1\u56FD",
      nameEn: "United Kingdom of Great Britain and Northern Ireland",
      currencyCode: "GBP"
    },
    {
      code: "VG",
      name: "\u82F1\u5C5E\u7EF4\u5C14\u4EAC\u7FA4\u5C9B",
      nameEn: "Virgin Islands, British",
      currencyCode: "USD"
    },
    {
      code: "IO",
      name: "\u82F1\u5C5E\u5370\u5EA6\u6D0B\u9886\u5730",
      nameEn: "British Indian Ocean Territory",
      currencyCode: "GBP"
    },
    {
      code: "IO",
      name: "\u82F1\u5C5E\u5370\u5EA6\u6D0B\u9886\u5730",
      nameEn: "British Indian Ocean Territory",
      currencyCode: "USD"
    },
    {
      code: "JO",
      name: "\u7EA6\u65E6",
      nameEn: "Jordan",
      currencyCode: "JOD"
    },
    {
      code: "VN",
      name: "\u8D8A\u5357",
      nameEn: "Viet Nam",
      currencyCode: "VND"
    },
    {
      code: "ZM",
      name: "\u8D5E\u6BD4\u4E9A",
      nameEn: "Zambia",
      currencyCode: "ZMW"
    },
    {
      code: "JE",
      name: "\u6CFD\u897F",
      nameEn: "Jersey",
      currencyCode: "GBP"
    },
    {
      code: "TD",
      name: "\u4E4D\u5F97",
      nameEn: "Chad",
      currencyCode: "XAF"
    },
    {
      code: "GI",
      name: "\u76F4\u5E03\u7F57\u9640",
      nameEn: "Gibraltar",
      currencyCode: "GIP"
    },
    {
      code: "CL",
      name: "\u667A\u5229",
      nameEn: "Chile",
      currencyCode: "CLF"
    },
    {
      code: "CL",
      name: "\u667A\u5229",
      nameEn: "Chile",
      currencyCode: "CLP"
    },
    {
      code: "CF",
      name: "\u4E2D\u975E",
      nameEn: "Central African Republic",
      currencyCode: "XAF"
    },
    {
      code: "CN",
      name: "\u4E2D\u56FD",
      nameEn: "China",
      currencyCode: "CNY"
    },
    {
      code: "TW",
      name: "\u4E2D\u56FD\u53F0\u6E7E",
      nameEn: "Taiwan, Province of China",
      currencyCode: "TWD"
    },
    {
      code: "HK",
      name: "\u4E2D\u56FD\u9999\u6E2F",
      nameEn: "Hong Kong",
      currencyCode: "HKD"
    }
  ];
  const counties = new Map(countyCurrencyCodes.map((v) => [v.code, v]));
  const metadataKey = "Metadata:JsonProperty";
  function JsonProperty(config = {}) {
    return (target, property) => {
      config.alias = config.alias || property;
      Reflect.defineMetadata(metadataKey, config, target, property);
    };
  }
  function JsonAlias(alias) {
    return (target, property) => {
      const config = Reflect.getMetadata(metadataKey, target, property) || {};
      config.alias = alias || property;
      Reflect.defineMetadata(metadataKey, config, target, property);
    };
  }
  class Serializable {
    toJson() {
      const anyThis = this;
      const json = {};
      Object.keys(this).forEach((propKey) => {
        const config = Reflect.getMetadata(metadataKey, this, propKey);
        const prop = anyThis[propKey];
        if (!config || !prop) {
          return;
        }
        if (config.typeAs || config.typeAs === Map) {
          json[config.alias] = {};
          prop.forEach((v, k) => {
            json[config.alias][k] = v;
          });
          return;
        }
        if (prop instanceof Serializable) {
          json[config.alias] = prop.toJson();
          return;
        }
        json[config.alias] = prop;
      });
      return json;
    }
    toJsonString() {
      return JSON.stringify(this.toJson());
    }
    readJson(json) {
      const anyThis = this;
      Object.keys(this).forEach((propKey) => {
        const config = Reflect.getMetadata(metadataKey, this, propKey);
        const prop = anyThis[propKey];
        const jsonNode = json[config.alias];
        if (!config || !jsonNode) {
          return;
        }
        if (config.typeAs || config.typeAs === Map) {
          anyThis[propKey] = new Map(Object.entries(jsonNode));
          return;
        }
        if (prop instanceof Serializable) {
          prop.readJson(jsonNode);
          return;
        }
        anyThis[propKey] = jsonNode;
      });
      return this;
    }
    readJsonString(jsonString) {
      return this.readJson(JSON.parse(jsonString));
    }
  }
  class Http {
    static parseResponse(response, respType) {
      const data = JSON.parse(response.response);
      const res = new respType();
      return res.readJson(data);
    }
    static request(details, respType) {
      return new Promise((resolve, reject) => {
        details.onload = (response) => resolve(this.parseResponse(response, respType));
        details.onerror = (error) => reject(error);
        b(details);
      });
    }
    static get(url, respType, details) {
      if (!details) {
        details = { url };
      }
      details.method = "GET";
      return this.request(details, respType);
    }
    static post(url, respType, details) {
      if (!details) {
        details = { url };
      }
      details.method = "POST";
      return this.request(details, respType);
    }
  }
  var __defProp$1 = Object.defineProperty;
  var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
  var __decorateClass$1 = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp$1(target, key, result);
    return result;
  };
  class RateRes extends Serializable {
    constructor() {
      super(...arguments);
      __publicField(this, "result");
      __publicField(this, "provider");
      __publicField(this, "documentation");
      __publicField(this, "termsOfUse");
      __publicField(this, "timeLastUpdateUnix");
      __publicField(this, "timeLastUpdateUtc");
      __publicField(this, "timeNextUpdateUnix");
      __publicField(this, "timeNextUpdateUtc");
      __publicField(this, "timeEolUnix");
      __publicField(this, "baseCode");
      __publicField(this, "rates");
    }
  }
  __decorateClass$1([
    JsonAlias("result")
  ], RateRes.prototype, "result", 2);
  __decorateClass$1([
    JsonAlias("provider")
  ], RateRes.prototype, "provider", 2);
  __decorateClass$1([
    JsonAlias("documentation")
  ], RateRes.prototype, "documentation", 2);
  __decorateClass$1([
    JsonAlias("terms_of_use")
  ], RateRes.prototype, "termsOfUse", 2);
  __decorateClass$1([
    JsonAlias("time_last_update_unix")
  ], RateRes.prototype, "timeLastUpdateUnix", 2);
  __decorateClass$1([
    JsonAlias("time_last_update_utc")
  ], RateRes.prototype, "timeLastUpdateUtc", 2);
  __decorateClass$1([
    JsonAlias("time_next_update_unix")
  ], RateRes.prototype, "timeNextUpdateUnix", 2);
  __decorateClass$1([
    JsonAlias("time_next_update_utc")
  ], RateRes.prototype, "timeNextUpdateUtc", 2);
  __decorateClass$1([
    JsonAlias("time_eol_unix")
  ], RateRes.prototype, "timeEolUnix", 2);
  __decorateClass$1([
    JsonAlias("base_code")
  ], RateRes.prototype, "baseCode", 2);
  __decorateClass$1([
    JsonProperty({
      alias: "rates",
      typeAs: Map
    })
  ], RateRes.prototype, "rates", 2);
  class ExchangeRateApi {
    async getRates() {
      log__default.default.info("\u901A\u8FC7 www.exchangerate-api.com \u83B7\u53D6\u6C47\u7387");
      let rates = /* @__PURE__ */ new Map();
      await Http.get("https://open.er-api.com/v6/latest/CNY", RateRes).then((res) => rates = res.rates);
      return rates;
    }
  }
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp2(target, key, result);
    return result;
  };
  const RateCacheStorageKey = "Storage:RateCache";
  class RateCache extends Serializable {
    constructor() {
      super(...arguments);
      __publicField(this, "expiredAt", 0);
      __publicField(this, "rates", /* @__PURE__ */ new Map());
    }
    expired() {
      return this.expiredAt < new Date().getTime();
    }
  }
  __decorateClass([
    JsonAlias("expiredAt")
  ], RateCache.prototype, "expiredAt", 2);
  __decorateClass([
    JsonProperty({
      alias: "rates",
      typeAs: Map
    })
  ], RateCache.prototype, "rates", 2);
  const _ExchangeRateManager = class {
    constructor() {
      __publicField(this, "rateApis", new Array());
      __publicField(this, "rateCache");
      this.rateApis.push(new ExchangeRateApi());
    }
    getRates() {
      return this.rateApis[0].getRates();
    }
    async refreshRate() {
      if (!this.rateCache) {
        this.rateCache = this.loadRateCache();
        return this.refreshRate();
      }
      if (this.rateCache.expired()) {
        log__default.default.info("\u672C\u5730\u7F13\u5B58\u5DF2\u8FC7\u671F");
        this.rateCache.rates = await this.getRates();
        this.rateCache.expiredAt = new Date().getTime() + 1e3 * 60 * 60;
        this.saveRateCache(this.rateCache);
      }
      return this.rateCache;
    }
    loadRateCache() {
      log__default.default.info("\u8BFB\u53D6\u672C\u5730\u6C47\u7387\u7F13\u5B58");
      const jsonString = h(RateCacheStorageKey, "{}");
      const cache = new RateCache();
      return cache.readJsonString(jsonString);
    }
    saveRateCache(rateCache) {
      log__default.default.info("\u4FDD\u5B58\u672C\u5730\u6C47\u7387\u7F13\u5B58");
      u(RateCacheStorageKey, rateCache.toJsonString());
    }
  };
  let ExchangeRateManager = _ExchangeRateManager;
  __publicField(ExchangeRateManager, "instance", new _ExchangeRateManager());
  const style = "";
  async function main(targetCounty) {
    let countyCode = await getCountyCode();
    if (targetCounty.code === countyCode) {
      log__default.default.info(`${targetCounty.name}\u65E0\u9700\u8F6C\u6362`);
      return;
    }
    const currCounty = counties.get(countyCode);
    if (!currCounty) {
      throw Error("\u83B7\u53D6\u8D27\u5E01\u4EE3\u7801\u5931\u8D25");
    }
    log__default.default.info("\u83B7\u53D6\u8D27\u5E01\u4EE3\u7801", currCounty);
    let rate;
    await ExchangeRateManager.instance.refreshRate().then((resRate) => rate = resRate.rates.get(currCounty.currencyCode));
    if (rate) {
      log__default.default.info(`\u6C47\u7387\uFF1A${rate}`);
    } else {
      throw Error("\u83B7\u53D6\u6C47\u7387\u5931\u8D25");
    }
    await convert(rate);
  }
  async function getCountyCode() {
    const countyCode = self == top ? await getCountyCodeNotInIframe() : await getCountyCodeInIframe();
    if (countyCode) {
      log__default.default.info("\u6210\u529F\u83B7\u53D6\u5230\u56FD\u5BB6\u4EE3\u7801\uFF1A", countyCode);
      return countyCode;
    }
    throw Error("\u83B7\u53D6\u56FD\u5BB6\u4EE3\u7801\u5931\u8D25\uFF01");
  }
  async function getCountyCodeInIframe() {
    let countyCode = null;
    if (window.location.href.includes("store.steampowered.com")) {
      document.querySelectorAll("script").forEach((scriptEl) => {
        if (scriptEl.innerText.includes("$J( InitMiniprofileHovers );")) {
          countyCode = scriptEl.innerText.trim().replaceAll(/[\n\t\s ]/g, "").split(";").filter((str) => str.startsWith("GDynamicStore.Init"))[0].split(",")[16].replaceAll(/'/g, "").trim();
        }
      });
      if (countyCode) {
        return countyCode;
      }
    }
    const iframeGetPromise = new Promise((resolve) => M.list({ name: "steamCountry" }, (cookies) => {
      if (cookies && cookies.length > 0) {
        const match = cookies[0].value.match(/^[a-zA-Z][a-zA-Z]/);
        if (match) {
          resolve(match[0]);
        }
      }
      resolve(null);
    }));
    countyCode = await iframeGetPromise;
    if (countyCode) {
      log__default.default.info("\u901A\u8FC7 cookie \u83B7\u53D6\u56FD\u5BB6\u4EE3\u7801 : " + countyCode);
      return countyCode;
    }
    throw Error("\u83B7\u53D6\u56FD\u5BB6\u4EE3\u7801\u5931\u8D25");
  }
  async function getCountyCodeNotInIframe() {
    let countyCode = null;
    if (window.location.href.includes("store.steampowered.com")) {
      document.querySelectorAll("script").forEach((scriptEl) => {
        if (scriptEl.innerText.includes("$J( InitMiniprofileHovers );")) {
          countyCode = scriptEl.innerText.trim().replaceAll(/[\n\t\s ]/g, "").split(";").filter((str) => str.startsWith("GDynamicStore.Init"))[0].split(",")[16].replaceAll(/'/g, "").trim();
        }
      });
      if (countyCode) {
        return countyCode;
      }
    }
    await new Promise((resolve) => b({
      url: "https://store.steampowered.com/",
      onload: (response) => resolve(response.responseText)
    })).then((res) => {
      const match = res.match(new RegExp("(?<=GDynamicStore.Init\\(.+')[A-Z][A-Z](?=',)"));
      if (!match || match.length <= 0) {
        throw Error("\u83B7\u53D6\u56FD\u5BB6\u4EE3\u7801\u5931\u8D25");
      }
      countyCode = match[0];
    });
    if (countyCode) {
      return countyCode;
    }
    throw Error("\u83B7\u53D6\u56FD\u5BB6\u4EE3\u7801\u5931\u8D25");
  }
  async function convert(rate) {
    const exchangerManager = ConverterManager.instance;
    const elements = document.querySelectorAll(exchangerManager.getSelector());
    exchangerManager.convert(elements, rate);
    const priceObserver = new MutationObserver((mutations) => {
      mutations.forEach(async (mutation) => {
        const target = mutation.target;
        const selector = exchangerManager.getSelector();
        const priceEls = target.querySelectorAll(selector);
        if (!priceEls || priceEls.length === 0) {
          return;
        }
        exchangerManager.convert(priceEls, rate);
      });
    });
    priceObserver.observe(document, {
      childList: true,
      subtree: true
    });
  }
  (async () => {
    log__default.default.setLevel("DEBUG");
    log__default.default.setLevel("INFO");
    const cn = counties.get("CN");
    await main(cn);
  })();
})(log);
