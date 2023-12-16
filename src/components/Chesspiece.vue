<template>
    <img :src="image">
</template>

<script setup>
import {ref} from 'vue'
import imgBK from '@/assets/pieces/bk.png'
import imgWP from '@/assets/pieces/wp.png'
import imgWN from '@/assets/pieces/wn.png'
import imgWB from '@/assets/pieces/wb.png'
import imgWR from '@/assets/pieces/wr.png'
import imgWQ from '@/assets/pieces/wq.png'


const props = defineProps({
    piece: String,
})

let image;

switch(props.piece) {
    case 'player': image = imgBK; break;
    case 'pawn': image = imgWP; break;
    case 'knight': image = imgWN; break;
    case 'bishop': image = imgWB; break;
    case 'rook': image = imgWR; break;
    case 'queen': image = imgWQ; break;
    default: console.warn('invalid piece name')
}
</script>
