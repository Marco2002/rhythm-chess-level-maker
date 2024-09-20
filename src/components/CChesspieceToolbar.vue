<template>
    <div class="flex md:flex-col gap-4 items-center w-full md:w-24">
        <div
            class="grow w-full"
            v-for="chesspiece in chesspieces"
            v-bind:key="chesspiece"
        >
            <c-chesspiece-slot
                :pieceName="chesspiece"
                :piece-holder-key="chesspiece + 'Prefab'"
                is-factory
            />
        </div>
    </div>
</template>
<script setup>
import CChesspieceSlot from "@/components/CChesspieceSlot.vue"

let chesspieces = ["a", "P", "N", "B", "R", "Q"]
</script>
