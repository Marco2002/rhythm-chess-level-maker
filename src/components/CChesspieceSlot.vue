<template>
    <div
        class="c-chesspiece-slot__wrapper"
        :class="{ 'c-chesspiece-slot__wrapper--factory': isFactory }"
    >
        <draggable
            class="c-chesspiece-slot"
            v-model="pieceArr"
            tag="ul"
            :item-key="pieceHolderKey"
            :group="{ name: 'piece', put: !disabled, pull: !disabled }"
            @end="drag = !isFactory"
            @change="handleChange"
            @start="handleStart"
        >
            <template #item="{ element: p }">
                <img
                    :src="getImage(p)"
                    class="h-full w-full"
                    v-show="getImage(p)"
                />
            </template>
        </draggable>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { useStore } from "@/store"
import draggable from "vuedraggable"
import imgBK from "@/assets/pieces/bk.png"
import imgWP from "@/assets/pieces/wp.png"
import imgWN from "@/assets/pieces/wn.png"
import imgWB from "@/assets/pieces/wb.png"
import imgWR from "@/assets/pieces/wr.png"
import imgWQ from "@/assets/pieces/wq.png"
import { watch } from "vue"

const store = useStore()

const props = defineProps({
    pieceHolderKey: String,
    isFactory: {
        default: false,
        type: Boolean,
    },
    pieceName: String,
    x: Number,
    y: Number,
    disabled: Boolean,
})

const emit = defineEmits(["pickedPlayer", "setPlayer"])

let piece

watch(
    () => store.position,
    (newVal) => {
        if (props.isFactory) return
        else pieceArr.value[0] = ref(newVal[props.y][props.x])
    },
    { deep: true },
)

if (props.pieceName) {
    piece = ref(props.pieceName)
} else {
    if (
        store.position.length < store.height ||
        store.position[0].length < store.width
    )
        piece = ref("none")
    else piece = ref(store.position[props.y][props.x])
}

let pieceArr = ref([piece])

function getImage(piece) {
    let image = null
    switch (piece.value) {
        case "a":
            image = imgBK
            break
        case "P":
            image = imgWP
            break
        case "N":
            image = imgWN
            break
        case "B":
            image = imgWB
            break
        case "R":
            image = imgWR
            break
        case "Q":
            image = imgWQ
            break
        case "none":
            break
        case "x":
            break
        default:
            console.warn("invalid piece name: " + piece)
    }
    return image
}

function handleChange(event) {
    if (props.isFactory) {
        pieceArr.value[0] = piece
        if (event.added) {
            pieceArr.value = pieceArr.value.splice(1)
            pieceArr.value[0] = piece
        }
    }
    if (pieceArr.value.length > 1) {
        pieceArr.value = pieceArr.value.splice(1)
    }
    // change the position
    if (!props.isFactory) {
        if (event.added) {
            if (store.playMode && pieceArr.value[0].value === "a") {
                emit("setPlayer")
            }
            store.addPiece(props.x, props.y, pieceArr.value[0].value)
        } else if (event.removed) {
            store.removePiece(props.x, props.y)
        }
    }
}

function handleStart() {
    if (store.playMode && pieceArr.value[0].value === "a") {
        emit("pickedPlayer")
    }
}
</script>

<style lang="css">
.c-chesspiece-slot__wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
}

.c-chesspiece-slot {
    position: absolute;
    inset: 0;
}
</style>
