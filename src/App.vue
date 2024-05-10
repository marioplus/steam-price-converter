<template>
  <div class="mdui-theme-primary-indigo mdui-theme-accent-indigo">
    <div class="mdui-container">
      <!--      <button class="mdui-btn mdui-color-theme-accent mdui-ripple mdui-typo" mdui-dialog="{target: '#spc-dialog-menu'}">open</button>-->
      <div class="mdui-dialog" id="spc-dialog-menu">
        <div class="mdui-dialog-title">Setting</div>
        <div class="mdui-dialog-content">
          <div class="mdui-list">
            <li class="mdui-list-item mdui-ripple">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe7f1;</i>
              <div class="mdui-list-item-content">目标区域</div>
              <select class="mdui-select" :style="countySelectStyle" @change="
              // @ts-ignore
              changeCounty($event.target.value)">
                <option v-for="countyInfo in infos"
                        :value="countyInfo.code"
                        :selected="countyInfo.code===setting.countyCode">{{ countyInfo.name }}
                </option>
              </select>
            </li>

            <li class="mdui-list-item mdui-ripple">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe227;</i>
              <div class="mdui-list-item-content">货币符号</div>
              <label class="mdui-textfield" style="width: 40px">
                <input class="mdui-textfield-input" type="text" v-model="setting.currencySymbol"/>
              </label>
            </li>

            <li class="mdui-list-item mdui-ripple">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe236;</i>
              <div class="mdui-list-item-content">货币符号是否在价格之前</div>
              <label class="mdui-switch">
                <!-- @ts-ignore-->
                <input type="checkbox" v-model="setting.currencySymbolBeforeValue" @change="
                // @ts-ignore
                setting.currencySymbolBeforeValue=$event!.target!.checked!"/>
                <i class="mdui-switch-icon"></i>
              </label>
            </li>

            <li class="mdui-list-item mdui-ripple">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe42e;</i>
              <div class="mdui-list-item-content">使用自定义汇率</div>
              <label class="mdui-switch">
                <input type="checkbox" v-model="setting.useCustomRate"/>
                <i class="mdui-switch-icon"></i>
              </label>
            </li>

            <li class="mdui-list-item mdui-ripple" v-if="setting.useCustomRate">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe8d4;</i>
              <div class="mdui-list-item-content">自定义汇率</div>
              <label class="mdui-textfield" style="width: 40px">
                <input class="mdui-textfield-input" type="number" v-model="setting.customRate"/>
              </label>
            </li>

            <li class="mdui-list-item mdui-ripple" v-if="!setting.useCustomRate">
              <i class="mdui-list-item-icon mdui-icon material-icons">&#xe192;</i>
              <div class="mdui-list-item-content">汇率缓存时间(小时)</div>
              <label class="mdui-textfield" style="width: 40px">
                <input class="mdui-textfield-input" type="number" v-model="setting.rateCacheExpired"/>
              </label>
            </li>
          </div>
        </div>
        <div class="mdui-dialog-actions">
          <button class="mdui-btn mdui-ripple" onclick="location.reload()">关闭并刷新</button>
          <button class="mdui-btn mdui-ripple" mdui-dialog-close>关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import mdui from 'mdui'
import {GM_addValueChangeListener, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'
import {onMounted, reactive, watch} from 'vue'
import {SettingManager} from './setting/SettingManager'
import {countyCode2Info, infos} from './county/CountyInfo'

onMounted(() => {
  const menu = new mdui.Dialog('#spc-dialog-menu')
  // @ts-ignore
  GM_addValueChangeListener(IM_KEY_MENU_STATUS, (name, oldValue, newValue) => {
    if (IM_KEY_OPEN_MENU !== newValue) {
      return
    }
    GM_setValue(IM_KEY_MENU_STATUS, IM_KEY_CLOSE_MENU)
    menu!.open()
  })
})
const settingManager = SettingManager.instance
// const countyInfos = reactive(infos)
const countySelectStyle = reactive(initCountySelectStyle())
const setting = reactive({
  countyCode: settingManager.setting.countyCode,
  currencySymbol: settingManager.setting.currencySymbol,
  currencySymbolBeforeValue: settingManager.setting.currencySymbolBeforeValue,
  rateCacheExpired: settingManager.setting.rateCacheExpired / (60 * 60 * 1000),

  customRate: settingManager.setting.customRate,
  useCustomRate: settingManager.setting.useCustomRate,
})


watch(setting, newSetting => {
  newSetting.rateCacheExpired *= (60 * 60 * 1000)
  settingManager.saveSetting(settingManager.setting)
})

function initCountySelectStyle() {
  const countyInfo = countyCode2Info.get(settingManager.setting.countyCode)
  return {
    width: `${countyInfo!.name.length * 16 + 25}px`
  }
}

function changeCounty(code: string) {
  const countyInfo = countyCode2Info.get(code)
  // @ts-ignore
  countySelectStyle.width = `${countyInfo.name.length * 16 + 25}px`
  setting.countyCode = countyInfo!.code
}

// function resetSetting() {
//   settingManager.reset()
//   setting.countyCode = settingManager.setting.countyCode
//   setting.currencySymbol = settingManager.setting.currencySymbol
//   setting.currencySymbolBeforeValue = settingManager.setting.currencySymbolBeforeValue
//   setting.rateCacheExpired = settingManager.setting.rateCacheExpired / (60 * 60 * 1000)
//   setting.customRate = settingManager.setting.customRate
//   setting.useCustomRate = settingManager.setting.useCustomRate
// }

</script>

<style scoped lang="less">

</style>
