<template>
    <div
        class="c-loading-overlay bg-black/50 backdrop-blur-sm"
        v-show="modelValue"
    >
        <v-progress-circular
            :size="70"
            :width="7"
            indeterminate
        ></v-progress-circular>
    </div>
</template>

<script setup>
defineProps({
    modelValue: Boolean,
})
</script>
<style lang="css" scoped>
.c-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
}
</style>
