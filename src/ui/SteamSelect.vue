<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import IconChevron from '../assets/icons/chevron.svg'

// 模块作用域共享状态，用于实现“互斥打开”
const activeSelectId = ref<symbol | null>(null)

const props = defineProps<{
    modelValue: string | number | boolean
    options: { label: string; value: any }[]
    icon?: string
}>()
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const instanceId = Symbol('SteamSelect') // 每个实例唯一的 ID
const containerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({ transform: 'translate(0, 0)', width: '0px', top: '0px', left: '0px' })

const selectedLabel = computed(() => {
    const opt = props.options.find(o => o.value === props.modelValue)
    return opt ? opt.label : ''
})

const updatePosition = () => {
    if (containerRef.value && isOpen.value) {
        const rect = containerRef.value.getBoundingClientRect()
        dropdownStyle.value = {
            transform: 'none',
            width: `${rect.width}px`,
            top: `${rect.bottom + 1}px`,
            left: `${rect.left}px`
        }
    }
}

const scrollToSelected = async () => {
    await nextTick()
    if (listRef.value) {
        const selected = listRef.value.querySelector('.is-selected')
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' })
        }
    }
}

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        await nextTick()
        updatePosition()
        await scrollToSelected()
    }
}

const selectOption = (val: any) => {
    emit('update:modelValue', val)
    isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        const dropdown = document.querySelector('.steam-options-list')
        if (dropdown && dropdown.contains(event.target as Node)) return
        isOpen.value = false
    }
}

watch(isOpen, async (val) => {
    if (val) {
        activeSelectId.value = instanceId // 告诉大家我打开了
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)
    } else {
        if (activeSelectId.value === instanceId) {
            activeSelectId.value = null
        }
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
    }
})

// 监听全局活跃 ID，实现互斥
watch(activeSelectId, (newId) => {
    if (newId !== instanceId) {
        isOpen.value = false
    }
})

onMounted(() => {
    window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition)
})
</script>

<template>
    <div class="steam-select-container" ref="containerRef">
        <div class="steam-select" :class="{ 'is-open': isOpen }" @click="toggleDropdown">
            <span class="selected-text">{{ selectedLabel }}</span>
            <div class="steam-select-arrow" :class="{ 'is-open': isOpen }">
                <IconChevron />
            </div>
        </div>

        <Teleport to="body">
            <div v-if="isOpen" class="steam-options-list" :style="dropdownStyle" ref="listRef">
                <div v-for="opt in options" :key="opt.value" class="steam-option"
                    :class="{ 'is-selected': opt.value === modelValue }" @click="selectOption(opt.value)">
                    {{ opt.label }}
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped lang="scss">
@use "sass:color";
@use "../style/SteamStyle.scss" as *;

.steam-select-container {
    position: relative;
    width: 100%;
    user-select: none;
}

.steam-select {
    min-width: 40px;
    min-height: 14px;
    background-color: #292e36;
    color: #eee;
    padding: 7px 10px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;


    &:hover {
        background-color: #464d58;
    }

    &.is-open {
        background-color: #464d58;
    }
}

.selected-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
}

.steam-select-arrow {
    width: 20px;
    height: 20px;
    color: #1a9fff;
    transition: transform 0.2s;

    &.is-open {
        transform: rotate(180deg);
    }
}
</style>

<style lang="scss">
@use "../style/SteamStyle.scss" as *;

.steam-options-list {
    position: fixed;
    background-color: #373c44;
    border: 1px solid #101822;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 99999;
    max-height: 240px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 2px;
    @include steam-scroll;
}

.steam-option {
    padding: 8px 12px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        background-color: #1a9fff;
        color: #fff;
    }

    &.is-selected {
        background-color: rgba(26, 159, 255, 0.4);
        color: #fff;
    }
}
</style>
