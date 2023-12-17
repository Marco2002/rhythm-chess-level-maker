<template>
  <v-app>
    <v-navigation-drawer :width="400">
      
      <div class="pa-8">
        <h2 class="text-center pb-4">Configuration</h2>
        <v-text-field class="inline-block w-1/2 pr-2" label="width" type="number" :rules="[validateWidthAndHeight]" :min="1" :max="8" variant="outlined" v-model="store.width"></v-text-field>
        <v-text-field class="inline-block w-1/2 pl-2" label="height" type="number" :rules="[validateWidthAndHeight]" :min="1" :max="8" variant="outlined" v-model="store.height"></v-text-field>
        <v-text-field label="fen" variant="outlined" v-model="store.fen"></v-text-field>
      </div>
      
    </v-navigation-drawer>
    <v-main class="flex content-center justify-items-center items-center">
      <div class="flex flex-col gap-4 items-center w-40">
        <Chesspiece v-for="chesspiece in chesspieces" :piece="chesspiece" :key="chesspiece" :piece-holder-key="chesspiece+'Prefab'" is-factory/>
      </div>
      <div class="grow flex flex-col items-center">
        <Chessboard />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Chessboard from '@/components/Chessboard.vue'
import Chesspiece from '@/components/Chesspiece.vue'
import { useStore } from '@/store'

const store = useStore()

let chesspieces = ['a', 'P', 'N', 'B', 'R', 'Q']

function validateWidthAndHeight(value) {
  return value > 0 && value <= 8;
}
</script>
