<template>
  <v-app>
    <navigation></navigation>
    <v-main class="flex flex-col md:flex-row content-center justify-items-center items-center main-content md:mx-12 gap-4">
      <chesspiece-toolbar v-show="!store.playMode"/>
      
      <div class="flex grow flex-col-reverse gap-4 md:flex-row grow items-center justify-center md:mx-4">
        <div class="flex gap-4 items-center">
          <v-btn 
            :icon="store.playMode ? 'mdi-restore': 'mdi-play'" 
            @click="store.playMode ? store.reset() : store.play()"
            :color="store.playMode ? 'red' : 'primary'"
          ></v-btn>
          <div class="flex flex-col gap-4">
            <v-btn 
              v-show="store.playMode"
              size="large"
              rounded="xl"
              @click="automove(false)"
            >AUTO</v-btn>
            <v-btn 
              v-show="store.playMode"
              size="large"
              rounded="xl"
              @click="automove(true)"
            >CPU MOVE</v-btn>
          </div>
        </div>
        <div class="flex grow flex-col gap-4 align-center">
          <Chessboard/>
          <div class="text-center flex align-center gap-2">

              
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
              <v-chip 
                v-show="store.winnable === true"
                variant="outlined"
                class="text-green"
              >
                minimum number of turns: {{ store.minTurns }}
              </v-chip>
            <v-btn 
              size="small"
              icon="mdi-refresh"
              color="primary"
              density="comfortable"
              @click="store.evaluate"
            ></v-btn>
          </div>
        </div>
        
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import Chessboard from '@/components/Chessboard.vue'
import ChesspieceToolbar from '@/components/ChesspieceToolbar.vue'
import Navigation from '@/components/Navigation.vue'
import { useStore } from '@/store'
import { requestAutomove } from './socket'

const store = useStore()
const drawerOpen = ref(true)

watch(() => store.playMode, () => {
  drawerOpen.value = !store.playMode
})

function automove(cpu) {
  const config = {
    fen: store.fen,
    maxRank: store.height,
    maxFile: store.width,
    disabledFields: store.getNamedDisabledFields,
    flagRegion: store.getNamedFlagRegion,
    cpuTurn: cpu
  }
  requestAutomove(config).then(result => {
    store.makeMove(result.bestmove)
    if(result.ponder && !cpu) {
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

onMounted(() => {
  document.addEventListener("keydown", (event) => {
    if(event.code == 'Space' && store.playMode) {
      automove(true)
    }
  })
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

.main-content {
  @media screen and (max-width: 768px) {
    position: absolute;
    bottom: 420px;
    top: 20px;
    left: 10px;
    right: 10px;
  }
}

</style>