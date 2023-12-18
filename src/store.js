import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const files = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

// helper functions
function fenToPosition(fen, height, width) {
    const position = Array.from({length: height}).map(() => Array.from({length: width}).fill('none'));
    let ranks = fen.split('/');
    for(let y = 0; y < height; y++) {
        let x = width-1;
        for(let i = 0; i < ranks[y].length; i++) {
            if(ranks[y][i] >= '0' && ranks[y][i] <= '9') {
                x -= parseInt(ranks[y][i])
            } else {
                position[height-1-y][x] = ranks[y][i];
                x--;
            }
            
        }
    }
    return position;
}

function positionToFen(position) {
    let fen = "";
    for(let y = position.length-1; y >= 0; y--) {
        fen += "/";
        let fieldsWithoutPiece = 0;
        for(let x = position[0].length-1; x >= 0; x--) {
            if (position[y][x] == 'none') fieldsWithoutPiece++;
            else {
                if (fieldsWithoutPiece > 0) fen += fieldsWithoutPiece;
                fen += position[y][x];
                fieldsWithoutPiece = 0;
            }
        }
        if (fieldsWithoutPiece > 0) fen += fieldsWithoutPiece;
    }
    return fen.slice(1);
}

export const useStore = defineStore('counter', () => {
    // props
    const fen = ref('3a3/7/7/7/7/7/7/1PP4')
    const width = ref('7')
    const height = ref('8')
    const position = ref(fenToPosition(fen.value, height.value, width.value))
    const disabledFields = ref(['00', '11'])
    const flagRegion = ref(['03', '04'])
    // getters 

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

    return {
        fen, width, height, position, disabledFields, flagRegion,
        setWidth, setHeight, removePiece, addPiece, toggleDisabled, toggleFlag
    }

})

