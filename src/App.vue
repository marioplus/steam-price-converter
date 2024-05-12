<script lang="ts" setup>
import {GM_addValueChangeListener, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'
import {onMounted} from 'vue'
import {countyInfos} from './county/CountyInfo'
import {Dialog} from 'mdui'
import {Setting} from './setting/Setting'
import {SettingManager} from './setting/SettingManager'

const vueCountyInfos = countyInfos
const setting: Setting = Object.assign({}, SettingManager.instance.setting)

onMounted(() => {
  const dialog = document.querySelector('.setting') as Dialog

  dialog.querySelector('.setting-btn-canal')?.addEventListener('click', () => dialog.open = false)
  dialog.querySelector('.setting-btn-save')?.addEventListener('click', () => {
    SettingManager.instance.saveSetting(setting)
    dialog.open = false
  })

  // @ts-ignore
  GM_addValueChangeListener(IM_KEY_MENU_STATUS, (name, oldValue, newValue) => {
    if (IM_KEY_OPEN_MENU !== newValue) {
      return
    }
    GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_CLOSE_MENU)
    // menu!.open()
    dialog.open = true
  })
})

function getSelected(target: any): string {
  return target.querySelector('*[selected]')?.value
}

</script>
<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <mdui-dialog close-on-overlay-click class="setting">
    <span slot="headline">设置</span>
    <span slot="description">随心所欲设置 steam-price-converter</span>

    <!-- 目标区域 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>目标区域</label>
        <mdui-tooltip content="将价格转换为此区域的货币" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>

      <div class="setting-item-content">
        <mdui-select :value="setting.countyCode" placement="bottom"
                     @change="setting.countyCode = getSelected($event.target)">
          <mdui-menu-item v-for="countyInfo in vueCountyInfos" :value="countyInfo.code">
            {{ countyInfo.name }} ({{ countyInfo.code }})
          </mdui-menu-item>
        </mdui-select>
      </div>
    </div>

    <!-- 货币符号 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>货币符号</label>
        <mdui-tooltip content="转换后的价格的货币符号" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>

      <div class="setting-item-content">
        <mdui-text-field :value="setting.currencySymbol"
                         @change="setting.currencySymbol = $event.target.value"/>
      </div>
    </div>

    <!-- 货币符号展示位置 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>货币符号展示位置</label>
        <mdui-tooltip content="控制转换后的价格货币符号的位置" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>

      <div class="setting-item-content">
        <mdui-select :value="setting.currencySymbolBeforeValue.toString()" placement="bottom"
                     @change="setting.currencySymbolBeforeValue = getSelected($event.target)==='true'">
          <mdui-menu-item value="true">价格之前</mdui-menu-item>
          <mdui-menu-item value="false">价格之后</mdui-menu-item>
        </mdui-select>
      </div>
    </div>

    <!-- 汇率缓存有效期 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>汇率缓存有效期</label>
        <mdui-tooltip content="获取汇率后进行缓存，在此时间内将使用缓存汇率" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>
      <div class="setting-item-content">
        <mdui-text-field type="number" :value="setting.rateCacheExpired / (60 * 60 * 1000)" suffix="h"
                         @change="setting.rateCacheExpired = $event.target.value * (60 * 60 * 1000)"/>
      </div>
    </div>

    <!-- 使用自定义汇率 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>使用自定义汇率</label>
        <mdui-tooltip content="使用自定义汇率进行价格转换，不再回去区域，不再根据区域获取汇率" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>
      <div class="setting-item-content">
        <mdui-switch slot="end-icon" :value="setting.useCustomRate"
                     @change="setting.useCustomRate = $event.target.checked"/>
      </div>
    </div>

    <!-- 自定义汇率 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>自定义汇率</label>
        <mdui-tooltip content="开启“使用自定义汇率”后使用此汇率进行转换" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>
      <div class="setting-item-content">
        <mdui-text-field type="number" :value="setting.customRate"
                         @change="setting.customRate = $event.target.value"/>
      </div>
    </div>

    <mdui-button class="setting-btn-canal" slot="action" variant="text">取消</mdui-button>
    <mdui-button class="setting-btn-save" slot="action" variant="tonal">保存</mdui-button>
  </mdui-dialog>
</template>

<style scoped lang="less">
.setting-item {
  color: rgb(var(--mdui-color-on-surface));
  padding: 8px 0;
  min-width: 40em;
}

.setting-item-title {
  display: flex;
  align-items: center;
  padding: 8px 0;

  label {
    display: inline-block;
    padding-right: 0.4em;
    font-size: var(--mdui-typescale-body-large-size);
    font-weight: var(--mdui-typescale-body-medium-weight);
    letter-spacing: var(--mdui-typescale-body-medium-tracking);
    line-height: var(--mdui-typescale-body-medium-line-height);
  }

  .setting-region-title-icon {
    font-size: var(--mdui-typescale-body-large-size);
  }

}

mdui-select::part(menu) {
  max-height: 256px;
  overflow: auto;
}

mdui-text-field::part(suffix) {
  color: blue;
}
</style>
