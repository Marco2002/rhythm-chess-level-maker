<template>
    <div class="c-chessboard" :style="{
        width: width*100 +'px',
        height: height*100+'px'
    }">
        <div v-for="i in height" v-bind:key="i" class="c-chessboard__row">
            <div v-for="j in width" v-bind:key="j" 
                class="c-chessboard__tile"
                :class="{
                    offset: (i+j) % 2 == 1,
                }">
                <p v-if="j==1" class="rank">{{i}}</p>
                <p v-if="i==8" class="file">{{String.fromCharCode(96 + (9-j))}}</p>
            </div>  
        </div> 
    </div>
</template>

<script>
export default {
    name: 'Chessboard',
    props: {
        width: Number,
        height: Number,
    }
}
</script>

<style>

.c-chessboard {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
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
    font-size: 20px;
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