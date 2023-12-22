<template>
  <v-app>
    <v-navigation-drawer :width="400">
      
      <div class="pa-8">
        <h2 class="text-center pb-4">Configuration</h2>
        <v-text-field label="level name" variant="outlined" v-model="store.levelName"></v-text-field>

        <v-divider></v-divider>

        <div class="flex items-center">
          <v-text-field class="inline-block w-1/3 mt-6" label="width" type="number" variant="outlined" v-model="store.width" disabled></v-text-field>
          <div class="inline-block w-1/6 text-center">
            <v-btn class="mb-1" variant="text" density="compact" icon="mdi-plus" :disabled="store.width*1 >= 8" @click="store.width++"></v-btn>
            <v-btn class="mt-1 text-red" variant="text" density="compact" icon="mdi-minus" :disabled="store.width*1 <= 1" @click="store.width--"></v-btn>
          </div>
          <v-text-field class="inline-block w-1/3 mt-6" label="height" type="number" variant="outlined" v-model="store.height" disabled></v-text-field>
          <div class="inline-block w-1/6 text-center">
            <v-btn class="mb-1" variant="text" density="compact" icon="mdi-plus" :disabled="store.height*1 >= 8" @click="store.height++"></v-btn>
            <v-btn class="mt-1 text-red" variant="text" density="compact" icon="mdi-minus" :disabled="store.height*1 <= 1" @click="store.height--"></v-btn>
          </div>
        </div>
        <v-text-field label="fen" variant="outlined" v-model="store.fen" disabled></v-text-field>
        <v-text-field label="disabled fields" variant="outlined" v-model="store.getNamedDisabledFields" disabled></v-text-field>
        <v-text-field label="flag region" variant="outlined" v-model="store.getNamedFlagRegion" disabled></v-text-field>
        <v-btn class="w-full my-2" variant="outlined" @click="evaluate">evaluate</v-btn>
        <v-btn class="w-full my-2" @click="generate">generate file</v-btn>

        <v-divider class="my-6"></v-divider>

        <h2 class="text-center pb-4">Evaluation Result</h2>
        <div class="text-center">
          <v-chip 
            :prepend-icon="beatableIcon"
            :class="beatableColor"
          >
            Beatable
          </v-chip>
        </div>
        
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
import { ref, computed } from 'vue'
import Chessboard from '@/components/Chessboard.vue'
import Chesspiece from '@/components/Chesspiece.vue'
import { useStore } from '@/store'
import { requestEvaluate, requestGenerate } from './socket'

const store = useStore()

let chesspieces = ['a', 'P', 'N', 'B', 'R', 'Q']

function validateWidthAndHeight(value) {
  return value > 0 && value <= 8;
}

function evaluate() {
  const config = {
    levelName: store.levelName,
    fen: store.fen,
    maxRank: store.height,
    maxFile: store.width,
    disabledFields: store.getNamedDisabledFields,
    flagRegion: store.getNamedFlagRegion,
  }
  requestEvaluate(config)
}

function generate() {
  const config = {
    levelName: store.levelName,
    fen: store.fen,
    maxRank: store.height,
    maxFile: store.width,
    disabledFields: store.getNamedDisabledFields,
    flagRegion: store.getNamedFlagRegion,
  }
  requestGenerate(config)
}

const beatableIcon = computed(() => {
  return store.beatable === 'unkown' ? 'mdi-circle-outline' : ( store.beatable ? 'mdi-check-circle' : 'mdi-close-circle')
})
const beatableColor = computed(() => {
  return store.beatable === 'unkown' ? '' : ( store.beatable ? 'text-green' : 'text-red')
})
</script>
