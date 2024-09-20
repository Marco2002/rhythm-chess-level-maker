<template>
    <v-navigation-drawer
        :width="$vuetify.display.mobile ? 350 : 400"
        v-model="store.drawerOpen"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
    >
        <div class="pa-8">
            <h2 class="text-center pb-4">Level Editor</h2>
            <v-select
                label="Select"
                :items="store.levelNames"
                @update:modelValue="store.loadLevel"
                v-model="store.selectedLevel"
            ></v-select>
            <v-text-field
                label="level name"
                variant="outlined"
                v-model="store.levelName"
            ></v-text-field>
            <div class="flex mb-2 mt-n3 gap-2">
                <v-btn class="grow" @click="store.reloadLevel">RELOAD</v-btn>
                <v-btn
                    class="grow"
                    color="success"
                    :disabled="store.winnable !== true"
                    @click="store.saveLevel"
                    >SAVE</v-btn
                >
            </div>
            <v-divider></v-divider>

            <div class="flex items-center">
                <v-text-field
                    class="inline-block w-1/3 mt-6"
                    label="width"
                    type="number"
                    variant="outlined"
                    v-model="store.width"
                    disabled
                ></v-text-field>
                <div class="inline-block w-1/6 text-center">
                    <v-btn
                        class="mb-1"
                        variant="text"
                        density="compact"
                        icon="mdi-plus"
                        :disabled="store.width * 1 >= 8"
                        @click="store.width++"
                    ></v-btn>
                    <v-btn
                        class="mt-1 text-red"
                        variant="text"
                        density="compact"
                        icon="mdi-minus"
                        :disabled="store.width * 1 <= 1"
                        @click="store.width--"
                    ></v-btn>
                </div>
                <v-text-field
                    class="inline-block w-1/3 mt-6"
                    label="height"
                    type="number"
                    variant="outlined"
                    v-model="store.height"
                    disabled
                ></v-text-field>
                <div class="inline-block w-1/6 text-center">
                    <v-btn
                        class="mb-1"
                        variant="text"
                        density="compact"
                        icon="mdi-plus"
                        :disabled="store.height * 1 >= 8"
                        @click="store.height++"
                    ></v-btn>
                    <v-btn
                        class="mt-1 text-red"
                        variant="text"
                        density="compact"
                        icon="mdi-minus"
                        :disabled="store.height * 1 <= 1"
                        @click="store.height--"
                    ></v-btn>
                </div>
            </div>
            <div v-show="!$vuetify.display.mobile">
                <v-text-field
                    label="fen"
                    variant="outlined"
                    v-model="store.fen"
                    disabled
                ></v-text-field>
                <v-text-field
                    label="disabled fields"
                    variant="outlined"
                    v-model="store.getNamedDisabledFields"
                    disabled
                ></v-text-field>
                <v-text-field
                    label="flag region"
                    variant="outlined"
                    v-model="store.getNamedFlagRegion"
                    disabled
                ></v-text-field>
            </div>
            <v-btn
                class="w-full my-2"
                v-if="showGenerateButton"
                @click="generate"
                >generate file</v-btn
            >
        </div>
    </v-navigation-drawer>
</template>

<script setup>
import { useStore } from "@/store"
import { requestGenerate } from "@/scripts/socketManager"

const store = useStore()

const showGenerateButton = !(import.meta.env.VITE_PUBLIC_VERSION == "true")

function generate() {
    const config = store.getConfig
    requestGenerate(config)
}
</script>
