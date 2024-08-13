<template>
    <div class="c-chessboard" :style="{
        width: ($vuetify.display.mobile ? store.width*50 : store.width*100) +'px',
        height: ($vuetify.display.mobile ? store.height*50 : store.height*100)+'px'
    }">
        <div v-for="y in (store.height * 1)" v-bind:key="y" class="c-chessboard__row">
            <div v-for="x in (store.width * 1)" v-bind:key="y*10+x" 
                class="c-chessboard__tile"
                :class="{
                    offset: (y+x) % 2 == 1,
                    disabled: store.disabledFields.includes(`${x-1}${y-1}`),
                    flag: store.flagRegion.includes(`${x-1}${y-1}`)
                }"
                @click="clickHandler($event, x, y)"
                @contextmenu="rightClickHandler($event, x, y)">
                <Chesspiece :x="x-1" :y="y-1" :piece-holder-key="`piece${x}-${y}`"/>
                
                <p v-if="x==1" class="rank">{{y}}</p>
                <p v-if="y==store.height" class="file">{{String.fromCharCode(97 + (store.width*1-x))}}</p>
            </div>  
        </div> 
    </div>
</template>

<script setup>
import { useStore } from '@/store'
import Chesspiece from '@/components/Chesspiece.vue';

let store = useStore()
let clicks = 0
let timer;

const clickHandler = (event, x, y) => {
    if(store.playMode) return
    clicks++;
    if (clicks === 1) {
        store.toggleDisabled(x-1,y-1)
        timer = setTimeout( () => {
            clicks = 0
        }, 150);
    } else {
        store.toggleFlag(x-1, y-1)
        clearTimeout(timer);  
        clicks = 0;
    }
    
}

const rightClickHandler = (event, x, y) => {
    event.preventDefault()
    if(store.playMode) return
    store.toggleFlag(x-1,y-1)
}

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


.rank, .file {
    color: #4b7399;
    font-size: 24px;
    font-weight: 500;
    @media screen and (max-width: 768px) {
        font-size: 16px;
    }
}

.offset .rank, .offset .file, .flag .rank, .flag .file {
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