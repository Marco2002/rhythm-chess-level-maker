<template>
    <div
        class="c-chessboard w-screen md:w-full"
        :style="{ 'max-width': maxWidth }"
    >
        <div
            v-for="y in store.height * 1"
            v-bind:key="y"
            class="c-chessboard__row"
        >
            <div
                v-for="x in store.width * 1"
                v-bind:key="y * 10 + x"
                class="c-chessboard__tile"
                :class="{
                    offset: (y + x) % 2 == 1,
                    disabled: store.disabledFields.includes(`${x - 1}${y - 1}`),
                    flag: store.flagRegion.includes(`${x - 1}${y - 1}`),
                }"
                @click="clickHandler($event, x, y)"
                @contextmenu="rightClickHandler($event, x, y)"
            >
                <c-chesspiece-slot
                    :x="x - 1"
                    :y="y - 1"
                    :piece-holder-key="`piece${x}-${y}`"
                    :disabled="disabledSlotsMatrix[x - 1][y - 1]"
                    @picked-player="playerIsMoving = true"
                    @set-player="handlePlayerMove()"
                />

                <p v-if="x == 1" class="rank">{{ y }}</p>
                <p v-if="y == store.height" class="file">
                    {{ String.fromCharCode(97 + (store.width * 1 - x)) }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch, ref, computed } from "vue"
import { useStore } from "@/store"
import CChesspieceSlot from "@/components/CChesspieceSlot.vue"
import { useWindowSize } from "@vueuse/core"
import { useDisplay } from "vuetify"

const { mdAndUp } = useDisplay()

const { height, width } = useWindowSize()

let store = useStore()
let clicks = 0
let timer

const playerIsMoving = ref(false)

const clickHandler = (event, x, y) => {
    if (store.playMode) return
    clicks++
    if (clicks === 1) {
        store.toggleDisabled(x - 1, y - 1)
        timer = setTimeout(() => {
            clicks = 0
        }, 150)
    } else {
        store.toggleFlag(x - 1, y - 1)
        clearTimeout(timer)
        clicks = 0
    }
}

const rightClickHandler = (event, x, y) => {
    event.preventDefault()
    if (store.playMode) return
    store.toggleFlag(x - 1, y - 1)
}

const maxWidth = ref(
    (store.width / store.height) * height.value * (mdAndUp.value ? 0.8 : 0.6) +
        "px",
)

watch([() => store.width, () => store.height, height, width], () => {
    maxWidth.value =
        (store.width / store.height) *
            height.value *
            (mdAndUp.value ? 0.8 : 0.6) +
        "px"
})

const disabledSlotsMatrix = computed(() => {
    const res = Array.from({ length: store.width }, () =>
        Array(store.height).fill(false),
    )
    let playerPosition
    if (!store.playMode) return res

    // in playmode disable all slots except player
    for (let i = 0; i < store.width; i++) {
        res[i] = []
        for (let j = 0; j < store.height; j++) {
            res[i][j] = true
            if (store.position[j][i] === "a" && store.isPlayerTurn) {
                playerPosition = { x: i, y: j }
                res[i][j] = false
            }
        }
    }

    if (!store.isPlayerTurn || !playerIsMoving.value) return res
    // while player is moving, enable valid destination slots
    for (let i = 0; i < store.width; i++) {
        for (let j = 0; j < store.height; j++) {
            if (
                i <= playerPosition.x + 1 &&
                i >= playerPosition.x - 1 &&
                j <= playerPosition.y + 1 &&
                j >= playerPosition.y - 1
            ) {
                if (i === playerPosition.x && j === playerPosition.y) {
                    continue
                } else if (i !== playerPosition.x && j !== playerPosition.y) {
                    // disable corners if no piece
                    res[i][j] =
                        store.position[j][i] === "none" ||
                        store.position[j][i] === "x"
                } else {
                    // enable slots around player (not corners)
                    res[i][j] = store.position[j][i] === "x"
                }
            }
        }
    }
    return res
})

function handlePlayerMove() {
    playerIsMoving.value = false
    store.moveCount++
    store.toggleTurn()
}
</script>

<style>
.c-chessboard {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    max-height: 100vh;
}

.c-chessboard__row {
    display: flex;
    flex: 1 0;
    width: 100%;
}

.c-chessboard__tile {
    flex: 1 0;
    background-color: #eae9d2;
    position: relative;
}

.c-chessboard__tile.offset {
    background-color: #4b7399;
}

.c-chessboard__tile.disabled {
    background-color: transparent;
}

.c-chessboard__tile.flag {
    background-color: #779954;
}

.rank,
.file {
    color: #4b7399;
    font-size: 24px;
    font-weight: 500;
    @media screen and (max-width: 768px) {
        font-size: 16px;
    }
}

.offset .rank,
.offset .file,
.flag .rank,
.flag .file {
    color: #eae9d2;
}

.rank {
    position: absolute;
    top: 0;
    left: 4px;
}
.file {
    position: absolute;
    bottom: 0;
    right: 8px;
}
</style>
