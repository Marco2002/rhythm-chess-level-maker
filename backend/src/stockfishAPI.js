import { spawn } from "child_process"
import makeIni from "./util/makeIni.js"

export default class StockfishInstance {
    /**
     * Creates a new StockfishInstance
     */
    constructor() {
        this.fairyStockfish = spawn("./backend/stockfish")

        this.fairyStockfish.on("error", (err) => {
            console.error(`Failed to start subprocess fairy stockfish: ${err}`)
        })

        this.fairyStockfish.on("exit", (code) => {
            console.log(
                `Child process fairy stockfish exited with code ${code}`,
            )
        })
        this.running = false
    }

    /**
     * executes a function and prevents other functions from being executed at the same time
     * @param {function to execute} func
     */
    async #run(func) {
        if (this.running) {
            throw new Error("Stockfish is already running")
        }
        this.running = true
        await func()
        this.running = false
    }

    /**
     * configures the stockfish instance
     * @param {object} config
     */
    async setConfig(config) {
        const name = "RhythmChess" + Date.now()
        await makeIni(config, name)
        await this.#run(async () => {
            this.fairyStockfish.stdin.write(
                "load backend/output/variants.ini\n",
            )
            this.fairyStockfish.stdin.write("uci\n")
            this.fairyStockfish.stdin.write(
                `setoption name UCI_Variant value ${name}\n`,
            )
            this.fairyStockfish.stdin.write("ucinewgame\n")
            this.fairyStockfish.stdin.write("position startpos\n")
            return new Promise((resolve) => {
                this.fairyStockfish.stdout.on("data", (data) => {
                    const dataString = data.toString()
                    if (dataString.includes(`info string variant ${name}`)) {
                        resolve()
                    }
                })
            })
        })
    }

    async reset() {
        this.fairyStockfish.stdin.write("ucinewgame\n")
        this.fairyStockfish.stdin.write("position startpos\n")
    }

    /**
     * analyses the position for best move and if the position is winnable
     * @param {number} depth search depth
     * @returns {object} result {bestMove: string, winnable: boolean, minMoves: number}
     */
    async go(depth) {
        const result = {}
        await this.#run(async () => {
            this.fairyStockfish.stdin.write(`go depth ${depth}\n`)

            return new Promise((resolve) => {
                this.fairyStockfish.stdout.on("data", (data) => {
                    if (data.toString().includes("info depth ")) {
                        const infoStrings = data
                            .toString()
                            .split("\n")
                            .filter((s) => s.includes("score "))
                        infoStrings.forEach((s) => {
                            const currentDepth = s.split(" ")[2]

                            if (currentDepth != depth) return

                            const lastScore = {
                                result: s.split(" ")[8],
                                numberOfMoves: s.split(" ")[9],
                            }
                            if (
                                lastScore.result == "mate" &&
                                parseInt(lastScore.numberOfMoves) > 0
                            ) {
                                result.winnable = true
                                result.minMoves = parseInt(
                                    lastScore.numberOfMoves,
                                )
                            } else {
                                result.winnable = false
                            }
                        })
                    }
                    if (data.toString().includes("bestmove")) {
                        result.bestMove = data
                            .toString()
                            .split("bestmove ")[1]
                            .split(" ")[0]
                            .trim()
                        resolve(result)
                    }
                })
            })
        })
        return result
    }

    /**
     * clears hash table. Used to make response deterministic
     */
    clearHash() {
        this.fairyStockfish.stdin.write("ucinewgame\n")
    }

    /**
     * list all legal moves on current position
     * @returns {string[]} list of legal move
     */
    async goPerft() {
        this.fairyStockfish.stdin.write("go perft 1\n")

        // helper functions for data
        function getMoves(data) {
            const lines = data.toString().split("\n")
            const moves = []
            lines.forEach((l) => {
                const temp = l.split(":")
                if (temp.length > 1) moves.push(temp[0])
            })
            if (moves[moves.length - 1] == "Nodes searched") moves.pop()
            return moves
        }

        let result = []

        await this.#run(() => {
            return new Promise((resolve) => {
                this.fairyStockfish.stdout.on("data", (data) => {
                    if (data.toString().includes("Nodes searched:")) {
                        // handle 'go perft 1' output
                        result = result.concat(getMoves(data))
                        resolve()
                    } else {
                        result = result.concat(getMoves(data))
                    }
                })
            })
        })

        return result
    }

    /**
     * positions the board to the given fen (with moves) and player
     * @param {*} fen fen string
     * @param {*} player player whos turn it is
     * @param {*} moves moves to apply
     * @returns {object} result {activePlayer: string, fen: string}
     */
    async position(fen, player, moves) {
        function getFenPos(data) {
            const lines = data.toString().split("\n")
            const fen = lines.filter((l) => l.startsWith("Fen"))[0]
            const fenPos = fen.split(" ")[1]
            return fenPos
        }

        function getActivePlayer(data) {
            const lines = data.toString().split("\n")
            const fen = lines.filter((l) => l.startsWith("Fen"))[0]
            return fen.split(" ")[2]
        }

        const result = {}
        await this.#run(async () => {
            if (fen == "startpos") {
                this.fairyStockfish.stdin.write("position startpos\nd\n")
            } else if (moves == undefined) {
                this.fairyStockfish.stdin.write(
                    `position fen "${fen} ${player} - - 0 1"\nd\n`,
                )
            } else {
                this.fairyStockfish.stdin.write(
                    `position fen "${fen} ${player} - - 0 1" moves ${moves.join(" ")}\nd\n`,
                )
            }
            await new Promise((resolve) => {
                this.fairyStockfish.stdout.on("data", (data) => {
                    const stringData = data.toString()
                    if (stringData.includes("Fen: ")) {
                        result.activePlayer = getActivePlayer(stringData)
                        result.fen = getFenPos(stringData)
                        resolve()
                    }
                })
            })
        })
        return result
    }
}
