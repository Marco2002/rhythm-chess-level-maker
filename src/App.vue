<template>
    <v-app>
        <c-navigation />
        <v-main
            class="flex flex-col md:flex-row content-center justify-items-center items-center main-content md:mx-12 gap-4"
        >
            <c-chesspiece-toolbar v-show="!store.playMode" />
            <div
                class="flex flex-col-reverse md:flex-row content-center justify-items-center items-center gap-4 w-full"
            >
                <div class="flex flex-col gap-8">
                    <div class="flex gap-4">
                        <v-btn
                            :icon="store.playMode ? 'mdi-restore' : 'mdi-play'"
                            @click="store.playMode ? endPlay() : startPlay()"
                            :color="store.playMode ? 'red' : 'primary'"
                            @mousedown.prevent
                            variant="outlined"
                        ></v-btn>
                        <v-btn
                            icon="mdi-lightbulb"
                            color="success"
                            :variant="solving ? 'elevated' : 'outlined'"
                            @click="solve"
                            :disabled="store.winnable !== true"
                            v-if="store.playMode"
                        ></v-btn>
                        <v-btn
                            size="large"
                            rounded="xl"
                            @click="automove"
                            v-if="store.playMode"
                            >AUTO</v-btn
                        >
                        <v-btn
                            size="large"
                            rounded="xl"
                            @click="store.makeMove('skip')"
                            v-if="store.playMode"
                            >PASS</v-btn
                        >
                    </div>
                    <div class="flex flex-col gap-4" v-if="store.playMode">
                        <v-btn
                            size="large"
                            :variant="store.isCpuTurn ? 'elevated' : 'outlined'"
                            color="red"
                            rounded="xl"
                            @click.prevent
                            class="pointer-events-none"
                            >CPU</v-btn
                        >
                        <v-btn
                            size="large"
                            :variant="
                                store.isPlayerTurn ? 'elevated' : 'outlined'
                            "
                            color="success"
                            rounded="xl"
                            class="pointer-events-none"
                            @click.prevent
                            >PLAYER</v-btn
                        >
                    </div>
                    <p class="text-h5 text-center" v-if="store.playMode">
                        Move Count : {{ store.moveCount }}
                    </p>
                </div>
                <div
                    class="flex grow flex-col-reverse gap-4 md:flex-row grow items-center justify-center md:mx-4"
                >
                    <div class="flex grow flex-col gap-4 align-center">
                        <c-chessboard />
                        <div
                            class="text-center flex align-center gap-2"
                            v-show="!store.playMode"
                        >
                            <v-chip variant="outlined" :class="winnableColor">
                                <template v-slot:prepend>
                                    <v-icon
                                        :icon="winnableIcon"
                                        :class="{
                                            rotating:
                                                store.winnable === 'unkown',
                                            '-ml-2 mr-2': true,
                                        }"
                                    ></v-icon>
                                </template>
                                Winnable
                            </v-chip>
                            <v-chip
                                v-show="store.winnable === true"
                                variant="outlined"
                                class="text-green"
                            >
                                minimum number of moves: {{ store.minMoves }}
                            </v-chip>
                            <v-btn
                                size="small"
                                icon="mdi-refresh"
                                color="primary"
                                density="comfortable"
                                @click="store.evaluate"
                            ></v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </v-main>
        <div
            v-if="smAndDown"
            class="w-full absolute bottom-0 flex justify-center"
        >
            <v-btn
                icon="mdi-chevron-up"
                color="primary"
                variant="plain"
                density="compact"
                size="x-large"
                @click="store.drawerOpen = true"
            ></v-btn>
        </div>

        <c-loading-overlay :model-value="store.loading" />
    </v-app>
</template>

<script setup>
import { computed, onMounted, watch, ref } from "vue"
import CChessboard from "@/components/CChessboard.vue"
import CChesspieceToolbar from "@/components/CChesspieceToolbar.vue"
import CNavigation from "@/components/CNavigation.vue"
import CLoadingOverlay from "./components/CLoadingOverlay.vue"
import { requestEvaluate } from "@/scripts/socketManager.js"
import { useStore } from "@/store"
import { useDisplay } from "vuetify"

const store = useStore()
const { smAndDown } = useDisplay()

const solving = ref(false)

const delay = (millis) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(), millis)
    })

async function automove() {
    const res = await requestEvaluate(store.getConfig)
    store.makeMove(res.bestMove)
}

async function solve() {
    solving.value = true
    for (let i = 0; i < store.minMoves * 2; i++) {
        await automove()
        await delay(500)
    }
    solving.value = false
}

async function startPlay() {
    store.play()
}

function endPlay() {
    store.reset()
}

const winnableIcon = computed(() => {
    return store.winnable === "unkown"
        ? "mdi-loading"
        : store.winnable
          ? "mdi-check-circle"
          : "mdi-close-circle"
})
const winnableColor = computed(() => {
    return store.winnable === "unkown"
        ? ""
        : store.winnable
          ? "text-green"
          : "text-red"
})

onMounted(() => {
    document.addEventListener("keydown", (event) => {
        if (event.code == "Space" && store.playMode) {
            automove()
        } else if (
            event.code == "ShiftLeft" &&
            store.isPlayerTurn &&
            store.playMode
        ) {
            store.makeMove("skip")
        }
    })
})

watch(
    () => store.fen,
    (newVal) => {
        if (store.playMode || newVal == store.backupFen) return
    },
)
</script>
<style scoped>
@-webkit-keyframes rotating /* Safari and Chrome */ {
    from {
        -webkit-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
@keyframes rotating {
    from {
        -ms-transform: rotate(0deg);
        -moz-transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    to {
        -ms-transform: rotate(360deg);
        -moz-transform: rotate(360deg);
        -webkit-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}

.rotating {
    -webkit-animation: rotating 1s linear infinite;
    -moz-animation: rotating 1s linear infinite;
    -ms-animation: rotating 1s linear infinite;
    -o-animation: rotating 1s linear infinite;
    animation: rotating 1s linear infinite;
}

.main-content {
    @media screen and (max-width: 768px) {
        position: absolute;
        bottom: 420px;
        top: 20px;
        left: 10px;
        right: 10px;
    }
}
</style>
