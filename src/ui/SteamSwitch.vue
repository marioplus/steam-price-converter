<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean
}>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <div class="steam-switch" :class="{ 'is-on': props.modelValue }"
        @click="emit('update:modelValue', !props.modelValue)">
        <div class="steam-switch-thumb"></div>
    </div>
</template>

<style scoped lang="scss">
@use "../style/SteamStyle.scss" as *;

.steam-switch {
    width: 40px;
    height: 24px;
    background-color: #3d4450;
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s;

    &.is-on {
        background-color: #1a9fff;

        .steam-switch-thumb {
            left: 16px;
        }
    }

    &-thumb {
        width: 24px;
        height: 24px;
        background-color: #fff;
        border-radius: 50%;
        position: absolute;
        transition: left 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
}
</style>
