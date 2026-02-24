<template>
  <div id="spc-app">
    <SteamDialog :open="dialogOpen" title="价格转换" @close="dialogOpen = false">
      <div class="steam-settings-container">
        <!-- 目标区域 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">目标区域</div>
            <div class="desc">将价格转换为此区域的货币</div>
          </div>
          <div class="control">
            <SteamSelect v-model="setting.countyCode" :options="vueCountyInfos" />
          </div>
        </div>

        <!-- 货币符号 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">货币符号</div>
            <div class="desc">转换后的价格的货币符号</div>
          </div>
          <div class="control">
            <input type="text" class="steam-input" v-model="setting.currencySymbol" />
          </div>
        </div>

        <!-- 货币符号展示位置 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">货币符号展示位置</div>
            <div class="desc">控制转换后的价格货币符号的位置</div>
          </div>
          <div class="control">
            <SteamSelect v-model="setting.currencySymbolBeforeValue" :options="currencyPositionOptions" />
          </div>
        </div>

        <!-- 汇率缓存有效期 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">汇率缓存有效期 (小时)</div>
            <div class="desc">在此时间内将使用缓存汇率</div>
          </div>
          <div class="control">
            <input type="number" class="steam-input" :value="setting.rateCacheExpired / (60 * 60 * 1000)"
              @input="setting.rateCacheExpired = (Number(($event.target as HTMLInputElement).value) * (60 * 60 * 1000))" />
          </div>
        </div>

        <!-- 使用自定义汇率 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">使用自定义汇率</div>
            <div class="desc">手动指定转换比率，不再自动获取</div>
          </div>
          <div class="control">
            <SteamSwitch v-model="setting.useCustomRate" />
          </div>
        </div>

        <!-- 自定义汇率 -->
        <div class="setting-row" v-if="setting.useCustomRate">
          <div class="info">
            <div class="label">自定义汇率</div>
            <div class="desc">开启“使用自定义汇率”后生效</div>
          </div>
          <div class="control">
            <input type="number" class="steam-input" v-model="setting.customRate" />
          </div>
        </div>

        <!-- 在市场页面禁用 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">在市场首页禁用</div>
            <div class="desc">防止与其他市场插件冲突，开启后在市场首页不进行转换</div>
          </div>
          <div class="control">
            <SteamSwitch v-model="setting.disableOnMarket" />
          </div>
        </div>

        <!-- 日志等级 -->
        <div class="setting-row">
          <div class="info">
            <div class="label">日志等级</div>
            <div class="desc">用于调试插件运行问题</div>
          </div>
          <div class="control">
            <SteamSelect v-model="setting.logLevel" :options="logLevels" />
          </div>
        </div>
      </div>

      <template #action>
        <button class="steam-btn gray" @click="resetSetting">重置</button>
        <button class="steam-btn gray" @click="dialogOpen = false">取消</button>
        <button class="steam-btn blue" @click="handleSave">保存设置</button>
      </template>
    </SteamDialog>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { IM_MENU_SETTING } from './constant/Constant'
import { countyInfos } from './county/CountyInfo'
import { Setting } from './setting/Setting'
import { SettingManager } from './setting/SettingManager'
import SteamDialog from './ui/SteamDialog.vue'
import SteamSelect from './ui/SteamSelect.vue'
import SteamSwitch from './ui/SteamSwitch.vue'
import { GmUtils } from './utils/GmUtils'
import { LogDefinitions } from './utils/Logger'

const vueCountyInfos = countyInfos.map(c => ({ label: `${c.name} (${c.code})`, value: c.code }))
const dialogOpen = ref(false)
const setting: Setting = reactive(new Setting())

GmUtils.addMenuClickEventListener(IM_MENU_SETTING, () => dialogOpen.value = true)

onMounted(() => Object.assign(setting, SettingManager.instance.setting))

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

const logLevels = Object.values(LogDefinitions).map(d => ({ label: d.label, value: d.label }))
const currencyPositionOptions = [
  { label: '价格之前', value: true },
  { label: '价格之后', value: false }
]

</script>

<style scoped lang="scss">
@use "./style/SteamStyle.scss" as *;

.steam-settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .info {
    flex: 1;
    min-width: 0;

    .label {
      font-size: 14px;
      color: #fff;
      margin-bottom: 4px;
    }

    .desc {
      font-size: 12px;
      color: $steam-color-label;
    }
  }

  .control {
    min-width: 40px;
    display: flex;
    justify-content: flex-end;
  }
}

.steam-input {
  width: 30px;
  background-color: #292e36;
  border: 0px solid #000;
  color: #fff;
  padding: 8px 12px;
  border-radius: 2px;
  font-family: inherit;
  outline: none;

  &:hover {
    background-color: #313841;
  }

  &:focus {
    background-color: #23262e;
    box-shadow: inset 0px 1px 6px rgba(0, 0, 0, 0.7);
  }

  // 隐藏 Chrome, Safari, Edge, Opera 的原生数字箭头
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  // 隐藏 Firefox 的原生数字箭头及解决兼容性告警
  &[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
}

.steam-btn {
  padding: 0 24px;
  height: 32px;
  font-size: 14px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.2);
  }

  &.blue {
    background: linear-gradient(to right, #3a9bed, #245ecf);
    color: #fff;
  }

  &.gray {
    background-color: $steam-btn-bg;
    color: #fff;
  }
}
</style>
