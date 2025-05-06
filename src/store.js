import { defineStore } from "pinia"
import { ref, watch, computed } from "vue"
import {
    fenToPosition,
    positionToFen,
    namedFieldToNumberedField,
    numberedFieldToNamedField,
} from "@/scripts/fenManager"
import {
    requestEvaluate,
    requestSave,
    requestGetLevels,
} from "./scripts/socketManager"

export const useStore = defineStore("counter", () => {
    // util variables
    let updatingConfig = false

    // props
    const levelName = ref("demo")
    const fen = ref("8/8/8/8/8/8/8/8")
    const width = ref("8")
    const height = ref("8")
    const position = ref(fenToPosition(fen.value, height.value, width.value))
    const disabledFields = ref([])
    const flagRegion = ref([])
    const turn = ref("b")
    const winnable = ref("unkown")
    const minMoves = ref(-1)
    const moveCount = ref(0)
    const playMode = ref(false)
    const backupFen = ref("8/8/8/8/8/8/8/8")
    const drawerOpen = ref(true)
    const loading = ref(false)
    const levels = ref([])
    const levelNames = ref([])
    const savedLevelConfig = ref({})
    const selectedLevel = ref("demo")

    // getters
    const getNamedDisabledFields = computed(() => {
        const namedFields = []
        disabledFields.value.forEach((field) => {
            namedFields.push(numberedFieldToNamedField(field, width.value))
        })
        return namedFields
    })
    const getNamedFlagRegion = computed(() => {
        const namedFields = []
        flagRegion.value.forEach((field) => {
            namedFields.push(numberedFieldToNamedField(field, width.value))
        })
        return namedFields
    })
    const getConfig = computed(() => {
        return {
            levelName: levelName.value,
            fen: fen.value,
            maxRank: height.value,
            maxFile: width.value,
            disabledFields: getNamedDisabledFields.value,
            flagRegion: getNamedFlagRegion.value,
            turn: turn.value,
        }
    })

    const isPlayerTurn = computed(() => {
        return turn.value === "b"
    })
    const isCpuTurn = computed(() => {
        return turn.value === "w"
    })
    // actions
    function setDisabledFields(fields) {
        disabledFields.value = []
        fields.forEach((field) =>
            disabledFields.value.push(
                namedFieldToNumberedField(field, width.value),
            ),
        )
    }

    function setFlagRegion(fields) {
        flagRegion.value = []
        fields.forEach((field) =>
            flagRegion.value.push(
                namedFieldToNumberedField(field, width.value),
            ),
        )
    }

    function setConfig(config) {
        console.log("setting conifg", config)
        updatingConfig = true
        levelName.value = config.levelName
        height.value = config.maxRank
        width.value = config.maxFile
        fen.value = config.fen
        setDisabledFields(config.disabledFields)
        setFlagRegion(config.flagRegion)
    }

    function setup() {
        return new Promise((resolve) => {
            requestGetLevels().then((value) => {
                levels.value = value
                loadLevel(selectedLevel.value)
                resolve()
            })
        })
    }

    function setWidth(width) {
        this.width.value = width
    }

    function setHeight(height) {
        this.height.value = height
    }

    function removePiece(x, y) {
        position.value[y][x] = "none"
        fen.value = positionToFen(position.value)
    }

    function addPiece(x, y, piece) {
        position.value[y][x] = piece
        fen.value = positionToFen(position.value)
    }

    function toggleDisabled(x, y) {
        const fieldName = `${x}${y}`
        if (position.value[y][x] !== "none" && position.value[y][x] !== "x")
            return

        if (flagRegion.value.includes(fieldName)) toggleFlag(x, y)

        if (disabledFields.value.includes(fieldName)) {
            const index = disabledFields.value.indexOf(fieldName)
            disabledFields.value.splice(index, 1)
            removePiece(x, y)
        } else {
            disabledFields.value.push(fieldName)
            addPiece(x, y, "x")
        }
    }

    function toggleFlag(x, y) {
        const fieldName = `${x}${y}`

        if (disabledFields.value.includes(fieldName)) toggleDisabled(x, y)

        if (flagRegion.value.includes(fieldName)) {
            const index = flagRegion.value.indexOf(fieldName)
            flagRegion.value.splice(index, 1)
        } else {
            flagRegion.value.push(fieldName)
        }
    }

    function toggleTurn() {
        this.turn = this.turn === "w" ? "b" : "w"
        document.activeElement.blur()
    }

    function play() {
        this.playMode = true
        this.turn = "b"
        this.moveCount = 0
        this.backupFen = this.fen
        document.activeElement.blur()
    }

    function reset() {
        this.playMode = false
        this.turn = "b"
        this.moveCount = 0
        this.fen = this.backupFen
    }

    function makeMove(move) {
        const from = namedFieldToNumberedField(
            move.substring(0, 2),
            width.value,
        )
        const to = namedFieldToNumberedField(move.substring(2, 4), width.value)
        const pos = position.value
        const piece = pos[from[1]][from[0]]
        if (piece === "a" || move === "skip") this.moveCount++
        if (move !== "skip") {
            pos[from[1]][from[0]] = "none"
            pos[to[1]][to[0]] = piece
        }
        fen.value = positionToFen(pos)
        this.toggleTurn()
    }

    async function evaluate() {
        if (playMode.value) return
        winnable.value = "unkown"
        minMoves.value = -1
        const config = getConfig.value
        requestEvaluate(config)
            .then((res) => {
                winnable.value = res.winnable
                minMoves.value = res.minMoves
            })
            .catch(() => {
                winnable.value = false
                minMoves.value = -1
            })
    }

    async function saveLevel() {
        loading.value = true
        const config = getConfig.value
        savedLevelConfig.value = config
        requestSave(config)
            .then(async () => {
                await setup()
                loading.value = false
            })
            .catch((err) => {
                console.log(err)
            })
    }

    function loadLevel(levelName) {
        const config = levels.value.filter(
            (level) => level.levelName === levelName,
        )[0]
        savedLevelConfig.value = config
        setConfig(config)
    }

    function reloadLevel() {
        setConfig(savedLevelConfig.value)
    }

    // watchers
    watch(fen, () => {
        if (updatingConfig) updatingConfig = false
        position.value = fenToPosition(fen.value, height.value, width.value)
        winnable.value = "unkown"
        evaluate()
    })
    watch(
        flagRegion,
        () => {
            winnable.value = "unkown"
            evaluate()
        },
        { deep: true },
    )
    watch(
        disabledFields,
        () => {
            winnable.value = "unkown"
            evaluate()
        },
        { deep: true },
    )
    watch(height, () => {
        if (updatingConfig) return
        let ranks = fen.value.split("/")
        if (ranks.length > height.value) {
            // height was reduced
            ranks = ranks.slice(Math.max(ranks.length - height.value, 0)) // adapt fen
            disabledFields.value = disabledFields.value.filter(
                (field) => field[1] * 1 < height.value,
            ) // remove disabled fields outside of new height
            flagRegion.value = flagRegion.value.filter(
                (field) => field[1] * 1 < height.value,
            ) // remove flag region fields outside of new height
        } else if (ranks.length < height.value) {
            // height was increased
            ranks.unshift(`${width.value}`)
        }
        fen.value = ranks.join("/")
    })

    watch(width, (newWidth, oldWidth) => {
        if (updatingConfig) return
        let ranks = fen.value.split("/")
        if (newWidth < oldWidth) {
            // width was reduced
            ranks = ranks.map((rank) => {
                if (rank.charAt(0) >= "2" && rank.charAt(0) <= "9") {
                    return rank.charAt(0) - 1 + rank.substring(1)
                } else {
                    return rank.substring(1)
                }
            })
            disabledFields.value = disabledFields.value.filter(
                (field) => field[0] * 1 < width.value,
            ) // remove disabled fields outside of new height
            flagRegion.value = flagRegion.value.filter(
                (field) => field[0] * 1 < width.value,
            ) // remove flag region fields outside of new height
        } else if (newWidth > oldWidth) {
            ranks = ranks.map((rank) => {
                if (rank.charAt(0) >= "1" && rank.charAt(0) <= "9") {
                    return rank.charAt(0) * 1 + 1 + rank.substring(1)
                } else {
                    return "1" + rank
                }
            })
        }
        fen.value = ranks.join("/")
    })

    watch(playMode, () => {
        drawerOpen.value = !playMode.value
    })

    watch(
        levels,
        () => {
            levelNames.value = levels.value.map((level) => level.levelName)
        },
        { deep: true },
    )

    return {
        levelName,
        fen,
        width,
        height,
        position,
        disabledFields,
        flagRegion,
        turn,
        winnable,
        minMoves,
        moveCount,
        playMode,
        backupFen,
        drawerOpen,
        loading,
        levels,
        levelNames,
        getNamedDisabledFields,
        getNamedFlagRegion,
        getConfig,
        isPlayerTurn,
        isCpuTurn,
        selectedLevel,
        setup,
        setConfig,
        setWidth,
        setHeight,
        removePiece,
        addPiece,
        toggleDisabled,
        toggleFlag,
        toggleTurn,
        play,
        reset,
        makeMove,
        evaluate,
        saveLevel,
        loadLevel,
        reloadLevel,
    }
})
