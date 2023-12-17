<template>
    <div class="c-chessboard" :style="{
        width: store.width*100 +'px',
        height: store.height*100+'px'
    }">
        <div v-for="y in (store.height * 1)" v-bind:key="y" class="c-chessboard__row">
            <div v-for="x in (store.width * 1)" v-bind:key="y*10+x" 
                class="c-chessboard__tile"
                :class="{
                    offset: (y+x) % 2 == 1,
                }">
                <Chesspiece :x="x-1" :y="y-1" :piece-holder-key="`piece${x}-${y}`"/>
                
                <p v-if="x==1" class="rank">{{y}}</p>
                <p v-if="y==store.height" class="file">{{String.fromCharCode(96 + (1+store.width*1-x))}}</p>
            </div>  
        </div> 
    </div>
</template>

<script setup>
import { useStore } from '@/store'
import Chesspiece from '@/components/Chesspiece.vue';

let store = useStore()

</script>

<style>

.c-chessboard {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
}

.c-chessboard__row {
    display: flex;
    flex: 1 0;
    width: 100%;
}

.c-chessboard__tile {
    flex: 1 0;
    background-color: #e9edcc;
    position: relative;
}

.c-chessboard__tile.offset {
    background-color: #779954;
}

.rank, .file {
    color: #779954;
    font-size: 24px;
    font-weight: 500;
}

.offset .rank, .offset .file {
    color: #e9edcc;
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