import { spawn } from "child_process"
// import fs from 'fs'

const matrix = new Map()
const depth = 40
let callStack = []
let fensWhereWhiteSkips = []
// let start
// let end
// let log
let currentFen
let currentMoves
let fairyStockfish
let jsonData

function callNextInStack(resolve) {
    if (callStack.length == 0) {
        // end = Date.now();
        // console.log('-----------end---------------')
        // console.log(matrix)
        fairyStockfish.stdin.end()
        fairyStockfish.kill()
        // fs.writeFile('./stockfish.log', log, function(err) {
        //     if(err) {
        //         return console.log(err)
        //     }
        // })
        // console.log(`execution time: ${end - start} ms`)
        resolve(matrix)
    } else {
        const val = callStack.pop()
        run(val)
    }
}

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

function getBestMove(data) {
    return data.toString().split("bestmove ")[1].split(" ")[0].trim()
}

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

function run(command) {
    // log += `======================= input =======================\n${command}\n=====================================================\n`
    fairyStockfish.stdin.write(command)
}

export default function getMovelist(data) {
    return new Promise((resolve) => {
        jsonData = data
        matrix.clear()
        callStack = []
        fensWhereWhiteSkips = []
        // start = Date.now();
        fairyStockfish = spawn("./backend/stockfish")
        fairyStockfish.stdout.on("data", (data) => {
            // log += data.toString()
            if (data.toString().includes("Fen: ")) {
                // handle 'd' output
                const activePlayer = getActivePlayer(data)
                currentFen = getFenPos(data)

                if (activePlayer === "b") {
                    // handle output of d when active player is black
                    if (getFenPos(data).includes("a")) {
                        // if 'a' (player) is not included, then player lost
                        run("go perft 1\n")
                    } else callNextInStack(resolve)
                } else {
                    // handle output of d when active player is white
                    if (matrix.has(currentFen)) callNextInStack(resolve)
                    else {
                        run(`go depth ${depth}\n`)
                    }
                }
            } else if (data.toString().includes("Nodes searched:")) {
                // handle 'go perft 1' output
                currentMoves = getMoves(data)
                currentMoves.forEach((move) => {
                    // if move is not a winning move add it to the stack to evaluate it
                    if (!jsonData.flagRegion.includes(move.substring(2, 4)))
                        callStack.push(
                            `position fen "${currentFen} b - - 0 1" moves ${move}\nd\n`,
                        )
                })
                callNextInStack(resolve)
            } else if (data.toString().includes(": 1")) {
                // handle 'go perft 1' output, but if it is just a substring and does not contain Nodes searched
                currentMoves = getMoves(data)
                // log += 'moves saved xxx:'
                currentMoves.forEach((move) => {
                    // if move is not a winning move add it to the stack to evaluate it
                    // log += move + ', '
                    if (!jsonData.flagRegion.includes(move.substring(2, 4)))
                        callStack.push(
                            `position fen "${currentFen} b - - 0 1" moves ${move}\nd\n`,
                        )
                })
                // log += '\n'
            } else if (data.toString().includes("bestmove")) {
                // handle 'go depth'
                const bestMove = getBestMove(data)

                if (
                    bestMove.includes("(none)") ||
                    bestMove.substring(0, 2) == bestMove.substring(2, 4)
                ) {
                    if (!fensWhereWhiteSkips.includes(currentFen)) {
                        fensWhereWhiteSkips.push(currentFen)
                        run(`position fen "${currentFen} b - - 0 1"\nd\n`)
                    } else {
                        callNextInStack(resolve)
                    }
                } else {
                    matrix.set(currentFen, bestMove.slice(0, 4))
                    run(
                        `position fen "${currentFen} w - - 0 1" moves ${bestMove}\nd\n`,
                    )
                }
            }
        })

        // Algorithm starts
        run("load backend/output/variants.ini\n")
        run("uci\n")
        run("setoption name Use NNUE value false\n")
        run("setoption name UCI_Variant value 1RhythmChess\n")
        run("setoption name Threads value 1\n")
        run("position startpos\nd\n")
    })
}
