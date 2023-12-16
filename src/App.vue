<template>
  <v-app>
    <v-navigation-drawer :width="400">
      
      <div class="pa-8">
        <h2 class="text-center pb-4">Configuration</h2>
        <v-text-field class="inline-block w-1/2 pr-2" label="width" type="number" :rules="[validateWidthAndHeight]" variant="outlined" v-model="width"></v-text-field>
        <v-text-field class="inline-block w-1/2 pl-2" label="height" type="number" :rules="[validateWidthAndHeight]" variant="outlined" v-model="height"></v-text-field>
      </div>
      
    </v-navigation-drawer>
    <v-main class="flex content-center justify-items-center items-center">
      <div class="flex flex-col gap-4 items-center w-40">
        <Chesspiece v-for="chesspiece in chesspieces" :piece="chesspiece" :key="chesspiece" :piece-holder-key="chesspiece+'Prefab'" is-factory/>
      </div>
      <div class="grow flex flex-col items-center">
        <Chessboard :width="Math.min(parseInt(width), 8)" :height="Math.min(parseInt(height), 8)" />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Chessboard from '@/components/Chessboard.vue'
import Chesspiece from '@/components/Chesspiece.vue'

let width = ref("8"), height = ref("8")
let chesspieces = ['player', 'pawn', 'knight', 'bishop', 'rook', 'queen']

function validateWidthAndHeight(value) {
  return value > 0 && value <= 8;
}
</script>
