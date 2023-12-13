<template>
  <v-app>
    <v-navigation-drawer>
      <v-list>
        <v-list-item title="Navigation drawer"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <Chessboard :width="8" :height="8" />
    </v-main>
  </v-app>
</template>

<script setup>
import Chessboard from '@/components/Chessboard.vue'
</script>
