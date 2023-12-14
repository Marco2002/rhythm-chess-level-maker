<template>
  <v-app>
    <v-navigation-drawer :width="400">
      
      <div class="pa-8">
        <h2 class="text-center pb-4">Configuration</h2>
        <v-text-field class="inline-block w-1/2 pr-2" label="width" type="number" :rules="[validateWidthAndHeight]" variant="outlined" v-model="width"></v-text-field>
        <v-text-field class="inline-block w-1/2 pl-2" label="height" type="number" :rules="[validateWidthAndHeight]" variant="outlined" v-model="height"></v-text-field>
      </div>
      
    </v-navigation-drawer>
    <v-main class="content-center grid">
      <Chessboard class="justify-self-center" :width="Math.min(parseInt(width), 8)" :height="Math.min(parseInt(height), 8)" />
    </v-main>
  </v-app>
</template>

<script setup>
import {ref} from 'vue'
import Chessboard from '@/components/Chessboard.vue'
let width = ref("8"), height = ref("8")

function validateWidthAndHeight(value) {
  return value > 0 && value <= 8;
}
</script>
