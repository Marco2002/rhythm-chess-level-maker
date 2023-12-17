<template>
    <draggable class="c-chesspiece" 
        v-model="pieceArr" 
        tag="ul" 
        :item-key="pieceHolderKey" 
        group="piece"
        @end="drag=!isFactory" 
        @change="handleChange"
    >
        <template #item="{ element: p }">
            <img :src="getImage(p)">
        </template>
        
    </draggable>
    
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import draggable from 'vuedraggable';
import imgBK from '@/assets/pieces/bk.png'
import imgWP from '@/assets/pieces/wp.png'
import imgWN from '@/assets/pieces/wn.png'
import imgWB from '@/assets/pieces/wb.png'
import imgWR from '@/assets/pieces/wr.png'
import imgWQ from '@/assets/pieces/wq.png'

const store = useStore()

const props = defineProps({
    pieceHolderKey: String,
    isFactory: {
        default: false,
        type: Boolean,
    },
    piece: String,
    x: Number,
    y: Number,
})

let piece

if(props.piece) {
    piece = ref(props.piece)
} else {
    piece = ref(store.position[props.y][props.x])
}

let pieceArr = ref([piece])

function getImage(piece) {
    let image = null;
    switch(piece.value) {
        case 'a': image = imgBK; break;
        case 'P': image = imgWP; break;
        case 'N': image = imgWN; break;
        case 'B': image = imgWB; break;
        case 'R': image = imgWR; break;
        case 'Q': image = imgWQ; break;
        case 'none': break;
        default: console.warn('invalid piece name: ' + piece)
    }
    return image
}

function handleChange(event) {
    if(props.isFactory) {
        pieceArr.value[0] = piece
        if(event.added) {
            pieceArr.value = pieceArr.value.splice(1)
            pieceArr.value[0] = piece
        }
    }
    if(pieceArr.value.length > 1) {
        pieceArr.value = pieceArr.value.splice(1)
    }
    // change the position 
    if(!props.isFactory) {
        if(event.added) {
            store.addPiece(props.x, props.y, pieceArr.value[0].value)
        } else if(event.removed) {
            store.removePiece(props.x, props.y)
        }
    }
}

</script>

<style scoped>
.c-chesspiece {
    width: 100px;
    height: 100px;
}
</style>