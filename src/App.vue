<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <mdui-dialog close-on-overlay-click class="example-headline-slot">
    <span slot="headline">Delete selected images?</span>
    <span slot="description">Images will be permenantly removed from you account and all synced devices.</span>

    <mdui-list>
      <mdui-list-item>
        <mdui-select slot="end-icon" label="显示区域" value="中国">
          <mdui-menu-item value="中国">中国</mdui-menu-item>
          <mdui-menu-item value="美国">美国</mdui-menu-item>
        </mdui-select>
      </mdui-list-item>

      <mdui-text-field clearable label="货币符号" value="￥"></mdui-text-field>

      <mdui-select label="货币符号展示位置" value="价格之前">
        <mdui-menu-item value="价格之前">价格之前</mdui-menu-item>
        <mdui-menu-item value="价格之后">价格之后</mdui-menu-item>
      </mdui-select>

      <mdui-text-field clearable label="汇率缓存有效期(小时)" value="2"></mdui-text-field>


      <mdui-list-item icon="people" end-icon="arrow_right">汇率缓存有效期(小时)</mdui-list-item>
      <mdui-list-item icon="people" end-icon="arrow_right">自定义汇率</mdui-list-item>
      <mdui-list-item icon="people">
        使用自定义汇率
        <mdui-switch slot="end-icon"></mdui-switch>
      </mdui-list-item>
    </mdui-list>

    <mdui-button slot="action" variant="text">取消</mdui-button>
    <mdui-button slot="action" variant="tonal">保存</mdui-button>
  </mdui-dialog>
</template>

<script lang="ts" setup>
import {GM_addValueChangeListener, GM_setValue} from 'vite-plugin-monkey/dist/client'
import {IM_KEY_CLOSE_MENU, IM_KEY_MENU_STATUS, IM_KEY_OPEN_MENU} from './constant/Constant'
import {onMounted, reactive, watch} from 'vue'
import {SettingManager} from './setting/SettingManager'
// import {countyCode2Info, infos} from './county/CountyInfo'
import {Dialog} from 'mdui'


onMounted(() => {
  const dialog = document.querySelector('.example-headline-slot') as Dialog
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
const settingManager = SettingManager.instance
// const countyInfos = reactive(infos)
// const countySelectStyle = reactive(initCountySelectStyle())
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

// function initCountySelectStyle() {
//   const countyInfo = countyCode2Info.get(settingManager.setting.countyCode)
//   return {
//     width: `${countyInfo!.name.length * 16 + 25}px`
//   }
// }

// function changeCounty(code: string) {
//   const countyInfo = countyCode2Info.get(code)
//   // @ts-ignore
//   countySelectStyle.width = `${countyInfo.name.length * 16 + 25}px`
//   setting.countyCode = countyInfo!.code
// }

</script>

<style scoped lang="less">

</style>
