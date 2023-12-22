import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { fenToPosition, positionToFen, namedFieldToNumberedField, numberedFieldToNamedField} from '@/helperFunctions'

export const useStore = defineStore('counter', () => {
    // props
    const levelName = ref('level1')
    const fen = ref('8/8/8/8/8/8/8/8')
    const width = ref('8')
    const height = ref('8')
    const position = ref(fenToPosition(fen.value, height.value, width.value))
    const disabledFields = ref([])
    const flagRegion = ref([])
    const beatable = ref('unkown')

    // getters 
    const getNamedDisabledFields = computed(() => {
        const namedFields = []
        disabledFields.value.forEach(field => {
            namedFields.push(numberedFieldToNamedField(field, width.value))
        })
        return namedFields
    })
    const getNamedFlagRegion = computed(() => {
        const namedFields = []
        flagRegion.value.forEach(field => {
            namedFields.push(numberedFieldToNamedField(field, width.value))
        })
        return namedFields
    })
    // actions
    function setWidth(width) {
        this.width.value = width
    }
    function setHeight(height) {
        this.height.value = height
    }
    function removePiece(x, y) {
        position.value[y][x] = 'none'
        fen.value = positionToFen(position.value);
    }
    function addPiece(x, y, piece) {
        position.value[y][x] = piece
        fen.value = positionToFen(position.value);
    }
    function toggleDisabled(x, y) {
        const fieldName = `${x}${y}`
        if(flagRegion.value.includes(fieldName)) return;
        
        if(disabledFields.value.includes(fieldName)) {
            const index = disabledFields.value.indexOf(fieldName)
            disabledFields.value.splice(index, 1);
        } else {
            disabledFields.value.push(fieldName)
        }
    }
    function toggleFlag(x, y) {      
        const fieldName = `${x}${y}`
        if(disabledFields.value.includes(fieldName)) return;

        if(flagRegion.value.includes(fieldName)) {
            const index = flagRegion.value.indexOf(fieldName)
            flagRegion.value.splice(index, 1);
        } else {
            flagRegion.value.push(fieldName)
        }
    }

    // watchers
    watch(fen, () => {
        position.value = fenToPosition(fen.value, height.value, width.value)
    })
    watch(height, () => {
        let ranks = fen.value.split('/')
        if(ranks.length > height.value) { // height was reduced 
            ranks = ranks.slice(Math.max(ranks.length - height.value, 0)) // adapt fen
            disabledFields.value = disabledFields.value.filter(field => field[1]*1 < height.value) // remove disabled fields outside of new height
            flagRegion.value = flagRegion.value.filter(field => field[1]*1 < height.value) // remove flag region fields outside of new height
        } else if(ranks.length < height.value) { // height was increased
            ranks.unshift(`${width.value}`)
        }
        fen.value = ranks.join('/')
    })
    watch(width, (newWidth, oldWidth) => {
        let ranks = fen.value.split('/')
        if(newWidth < oldWidth) { // width was reduced
            ranks = ranks.map(rank => {
                if(rank.charAt(0) >= '2' && rank.charAt(0) <= '9') {
                    return (rank.charAt(0) - 1) + rank.substring(1)
                } else {
                    return rank.substring(1)
                }
            })
            disabledFields.value = disabledFields.value.filter(field => field[0]*1 < width.value) // remove disabled fields outside of new height
            flagRegion.value = flagRegion.value.filter(field => field[0]*1 < width.value) // remove flag region fields outside of new height
        } else if(newWidth > oldWidth){
            ranks = ranks.map(rank => {
                if(rank.charAt(0) >= '1' && rank.charAt(0) <= '9') {
                    return (rank.charAt(0)*1 + 1) + rank.substring(1)
                } else {
                    return '1' + rank
                }
            })
        }
        fen.value = ranks.join('/')
    })

    return {
        levelName, fen, width, height, position, disabledFields, flagRegion, beatable,
        getNamedDisabledFields, getNamedFlagRegion,
        setWidth, setHeight, removePiece, addPiece, toggleDisabled, toggleFlag
    }

})

