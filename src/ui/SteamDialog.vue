<script setup lang="ts">
import { ref, computed } from 'vue'
import { GM_info } from '$'
import IconClose from '../assets/icons/close.svg'
import IconPriceConvert from '../assets/icons/price-convert.svg'
import IconAbout from '../assets/icons/about.svg'
import IconExternalLink from '../assets/icons/external-link.svg'

const props = defineProps<{
    open: boolean
    title: string
}>()

const emit = defineEmits(['close'])
const activeTab = ref('settings')

const displayTitle = computed(() => {
    return activeTab.value === 'settings' ? props.title : '关于插件'
})

const close = () => {
    emit('close')
}
</script>

<template>
    <div v-if="open" class="steam-dialog-overlay" @click.self="close">
        <div class="steam-dialog">
            <!-- Close Button (Absolute) -->
            <div class="close-btn" @click="close">
                <IconClose />
            </div>

            <div class="steam-dialog-body">
                <!-- Sidebar -->
                <div class="steam-sidebar">
                    <div class="sidebar-header">
                        <span class="title">SPC 设置</span>
                    </div>
                    <div class="sidebar-item" :class="{ active: activeTab === 'settings' }"
                        @click="activeTab = 'settings'">
                        <div class="icon">
                            <IconPriceConvert />
                        </div>
                        <span>价格转换</span>
                    </div>
                    <div class="sidebar-item" :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">
                        <div class="icon">
                            <IconAbout />
                        </div>
                        <span>关于插件</span>
                    </div>
                </div>

                <!-- Content Area -->
                <div class="steam-content-area">
                    <div class="content-header">
                        {{ displayTitle }}
                    </div>
                    <div class="content-body">
                        <template v-if="activeTab === 'settings'">
                            <slot></slot>
                        </template>
                        <template v-else-if="activeTab === 'about'">
                            <div class="about-container">
                                <div class="plugin-info">
                                    <div class="plugin-name">Steam Price Converter (SPC)</div>
                                    <div class="plugin-version">版本: {{ GM_info.script.version }}</div>
                                </div>

                                <div class="about-section">
                                    <div class="section-title">功能简介</div>
                                    <div class="section-content">
                                        基于第一性原理打造的 Steam 代购/多区域价格转换神器。
                                        支持自动获取最新汇率、自定义汇率以及多种货币符号展示方案。
                                    </div>
                                </div>

                                <div class="about-section">
                                    <div class="section-title">开源维护</div>
                                    <div class="section-content">
                                        本项目已在 GitHub 开源，欢迎提交 Issue 或 Pull Request。
                                        <a href="https://github.com/marioplus/steam-price-converter" target="_blank"
                                            class="steam-link">获取最新源代码
                                            <IconExternalLink
                                                style="width: 14px; height: 14px; margin-left: 4px; vertical-align: middle; display: inline-flex;" />
                                        </a>
                                    </div>
                                </div>

                                <div class="about-section">
                                    <div class="section-title">开发者</div>
                                    <div class="section-content">
                                        MarioPlus
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <!-- Footer Buttons -->
                    <div class="content-footer" v-if="activeTab === 'settings'">
                        <slot name="action"></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "../style/SteamStyle.scss" as *;

.steam-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: $steam-font-family;
}

.steam-dialog {
    width: 800px;
    max-width: 90vw;
    height: 600px;
    background-color: $steam-bg-dialog;
    color: $steam-color-text;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    border: 1px solid #444;
    overflow: hidden;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    color: $steam-color-label;
    z-index: 10;
    transition: color 0.2s;

    &:hover {
        color: #fff;
    }
}

.steam-dialog-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.steam-sidebar {
    width: 200px;
    background-color: #2a2d34;
    display: flex;
    flex-direction: column;

    .sidebar-header {
        padding: 24px 16px 12px;

        .title {
            color: $steam-blue-primary;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
    }
}

.sidebar-item {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    cursor: pointer;
    color: $steam-color-label;
    font-size: 14px;
    gap: 12px;

    .icon {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(svg) {
            width: 100%;
            height: 100%;
        }
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #fff;
    }

    &.active {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-left: 3px solid $steam-blue-primary;
    }

    &.disabled {
        cursor: default;
        opacity: 0.5;

        &:hover {
            background: transparent;
        }
    }
}

.steam-content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px 32px;
    background-color: #171d25;
    position: relative;

    .content-header {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #fff;
    }

    .content-body {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-gutter: stable;
        @include steam-scroll;
        padding-right: 8px;
    }

    .content-footer {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid $steam-border;
        margin-top: 16px;
    }
}

.about-container {
    color: $steam-color-text;
    line-height: 1.6;

    .plugin-info {
        margin-bottom: 32px;

        .plugin-name {
            font-size: 20px;
            font-weight: bold;
            color: #fff;
        }

        .plugin-version {
            font-size: 14px;
            color: $steam-color-label;
        }
    }

    .about-section {
        margin-bottom: 24px;

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: $steam-blue-primary;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .section-content {
            font-size: 14px;
            color: #bdc3c7;
        }
    }
}

.steam-link {
    color: $steam-blue-primary;
    text-decoration: none;
    margin-top: 8px;
    display: inline-block;

    &:hover {
        text-decoration: underline;
        color: $steam-blue-hover;
    }
}
</style>
