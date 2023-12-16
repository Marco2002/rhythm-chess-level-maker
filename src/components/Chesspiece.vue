<template>
    <draggable class="c-chesspiece" 
        v-model="pieceArr" 
        tag="ul" 
        :item-key="pieceHolderKey" 
        group="piece"
        @end="drag=!isFactory" 
        @change="(event) => {if(isFactory) pieceArr[0] = image; handleChange(event)}"
    >
        <template #item="{ element: image }">
            <img :src="image" >
        </template>
        
    </draggable>
    
</template>

<script setup>
import {ref} from 'vue'
import draggable from 'vuedraggable';
import imgBK from '@/assets/pieces/bk.png'
import imgWP from '@/assets/pieces/wp.png'
import imgWN from '@/assets/pieces/wn.png'
import imgWB from '@/assets/pieces/wb.png'
import imgWR from '@/assets/pieces/wr.png'
import imgWQ from '@/assets/pieces/wq.png'


const props = defineProps({
    piece: String,
    pieceHolderKey: String,
    isFactory: {
        default: false,
        type: Boolean,
    }
})

let image;

switch(props.piece) {
    case 'player': image = imgBK; break;
    case 'pawn': image = imgWP; break;
    case 'knight': image = imgWN; break;
    case 'bishop': image = imgWB; break;
    case 'rook': image = imgWR; break;
    case 'queen': image = imgWQ; break;
    case 'none': break;
    default: console.warn('invalid piece name')
}
let pieceArr = props.piece == 'none' ? ref([]) : ref([image])

function handleChange(event) {
    if(props.isFactory && event.added) {
        pieceArr.value = pieceArr.value.splice(1)
        pieceArr.value[0] = image
        console.log(pieceArr)
    }
    if(pieceArr.value.length > 1) {
        pieceArr.value = pieceArr.value.splice(1)
    }
}

</script>

<style scoped>
.c-chesspiece {
    width: 100px;
    height: 100px;
}
</style>