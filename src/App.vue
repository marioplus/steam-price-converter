<script lang="ts" setup>
import {IM_MENU_SETTING} from './constant/Constant'
import {onMounted, reactive, ref} from 'vue'
import {countyInfos} from './county/CountyInfo'
import {setColorScheme} from 'mdui'
import {Setting} from './setting/Setting'
import {SettingManager} from './setting/SettingManager'
import {GmUtils} from './utils/GmUtils'
import {LogDefinitions, LogLabel} from './utils/Logger'

setColorScheme('#171D25')

const vueCountyInfos = countyInfos
const dialogOpen = ref(false)
const setting: Setting = reactive(new Setting())

GmUtils.addMenuClickEventListener(IM_MENU_SETTING, () => dialogOpen.value = true)

onMounted(() => Object.assign(setting, SettingManager.instance.setting))

const getSelected = (target: any) => target.querySelector('*[selected]')?.value
const resetSetting = () => {
  const defaultSetting = new Setting()
  Object.assign(setting, defaultSetting)
  SettingManager.instance.saveSetting(setting)
  dialogOpen.value = false
}
const handleSave = () => {
  SettingManager.instance.saveSetting(setting)
  dialogOpen.value = false
}

</script>
<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <mdui-dialog close-on-esc close-on-overlay-click class="setting" :open="dialogOpen">
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
        <mdui-select :value="setting.countyCode"
                     icon="location_city"
                     placement="bottom"
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
        <mdui-text-field icon="currency_yen" :value="setting.currencySymbol"
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
        <mdui-select icon="location_on" :value="setting.currencySymbolBeforeValue.toString()" placement="bottom"
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
        <mdui-text-field icon="update" type="number" :value="setting.rateCacheExpired / (60 * 60 * 1000)" suffix="h"
                         @change="setting.rateCacheExpired = $event.target.value * (60 * 60 * 1000)"/>
      </div>
    </div>

    <!-- 使用自定义汇率 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>使用自定义汇率</label>
        <mdui-tooltip content="使用自定义汇率进行价格转换，不再获取区域，不再根据区域获取汇率" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>
      <div class="setting-item-content">
        <mdui-switch checked-icon="auto_awesome" unchecked-icon="auto_awesome" slot="end-icon" :value="setting.useCustomRate"
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
        <mdui-text-field icon="auto_awesome" type="number" :value="setting.customRate"
                         @change="setting.customRate = $event.target.value"/>
      </div>
    </div>

    <!-- 日志等级 -->
    <div class="setting-item">
      <div class="setting-item-title">
        <label>日志等级</label>
        <mdui-tooltip content="日志等级 debug > info > warn > error > off" placement="right">
          <mdui-icon name="error" class="setting-region-title-icon"/>
        </mdui-tooltip>
      </div>
      <div class="setting-item-content">
        <mdui-select icon="article" :value="setting.logLevel"
                     @change="setting.logLevel = getSelected($event.target) as LogLabel">
          <mdui-menu-item v-for="def in LogDefinitions" :value="def.label">{{ def.label }}</mdui-menu-item>
        </mdui-select>
      </div>
    </div>

    <mdui-button class="setting-btn-reset" slot="action" variant="text" @click="resetSetting">重置</mdui-button>
    <mdui-button class="setting-btn-canal" slot="action" variant="text" @click="dialogOpen=false">取消</mdui-button>
    <mdui-button class="setting-btn-save" slot="action" variant="filled" @click="handleSave">保存</mdui-button>
  </mdui-dialog>
</template>

<style scoped lang="less">
mdui-dialog::part(panel) {
  max-height: 50em;
}

.setting-item {
  color: rgb(var(--mdui-color-on-surface));
  padding: 1em .75em;
  min-width: 33em;
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

</style>
