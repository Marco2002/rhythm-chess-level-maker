<template>
  <v-app>
    <v-navigation-drawer :width="400" v-model="drawerOpen">
      
      <div class="pa-8" v-show="!store.playMode">
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
        <v-btn class="w-full my-2" @click="generate">generate file</v-btn>

        <v-divider class="my-6"></v-divider>

        <div class="flex justify-center align-center gap-4 pb-4">
          <h2 class="inline">
            Evaluation Result
          </h2>
          <v-btn 
            size="small"
            icon="mdi-refresh"
            color="primary"
            density="comfortable"
            @click="store.evaluate"
          ></v-btn>
        </div>
        <div class="text-center">
          <div>
            
            <v-chip 
              variant="outlined"
              :class="winnableColor"
            >
              <template v-slot:prepend>
                <v-icon :icon="winnableIcon" :class="{
                  'rotating': store.winnable === 'unkown',
                  '-ml-2 mr-2': true,
                }"></v-icon>
              </template>
              Winnable
            </v-chip>
          </div>
          <div class="pt-4">
            <v-chip 
              v-show="store.winnable === true"
              variant="outlined"
              class="text-green"
            >
              minimum number of turns: {{ store.minTurns }}
            </v-chip>
          </div>
        </div>
        
      </div>
      
    </v-navigation-drawer>
    <v-main class="flex content-center justify-items-center items-center">
      <div class="flex flex-col gap-4 items-center w-40" v-show="!store.playMode">
        <Chesspiece v-for="chesspiece in chesspieces" :piece="chesspiece" :key="chesspiece" :piece-holder-key="chesspiece+'Prefab'" is-factory/>
      </div>
      
      <div class="grow flex items-center justify-center">
        <div class="flex gap-4 pr-8 items-center">
          <v-btn 
            :icon="store.playMode ? 'mdi-restore': 'mdi-play'" 
            @click="store.playMode ? store.reset() : store.play()"
            :color="store.playMode ? 'red' : 'primary'"
          ></v-btn>
          <v-btn 
            v-show="store.playMode"
            size="large"
            rounded="xl"
            @click="automove"
          >AUTO</v-btn>
        </div>
        <div>
          <Chessboard />
        </div>
        
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import Chessboard from '@/components/Chessboard.vue'
import Chesspiece from '@/components/Chesspiece.vue'
import { useStore } from '@/store'
import { requestGenerate, requestAutomove } from './socket'

const store = useStore()
const drawerOpen = computed(() => !store.playMode)

let chesspieces = ['a', 'P', 'N', 'B', 'R', 'Q']

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

function automove() {
  const config = {
    fen: store.fen,
    maxRank: store.height,
    maxFile: store.width,
    disabledFields: store.getNamedDisabledFields,
    flagRegion: store.getNamedFlagRegion,
  }
  requestAutomove(config).then(result => {
    console.log(result)
    store.makeMove(result.bestmove)
    if(result.ponder) {
      setTimeout(() => store.makeMove(result.ponder), 500);
    }
  })
}

const winnableIcon = computed(() => {
  return store.winnable === 'unkown' ? 'mdi-loading' : ( store.winnable ? 'mdi-check-circle' : 'mdi-close-circle')
})
const winnableColor = computed(() => {
  return store.winnable === 'unkown' ? '' : ( store.winnable ? 'text-green' : 'text-red')
})
</script>
<style scoped>
@-webkit-keyframes rotating /* Safari and Chrome */ {
  from {
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes rotating {
  from {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.rotating {
  -webkit-animation: rotating 1s linear infinite;
  -moz-animation: rotating 1s linear infinite;
  -ms-animation: rotating 1s linear infinite;
  -o-animation: rotating 1s linear infinite;
  animation: rotating 1s linear infinite;
}
</style>