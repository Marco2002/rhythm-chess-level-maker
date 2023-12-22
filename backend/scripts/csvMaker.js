const {spawn} = require('child_process')
const jsonData = require('../input.json')
const fs = require('fs')
let start
let end
let log
let currentFen
let currentMoves
const matrix = new Map()
const callStack = []
fensWhereWhiteSkips = []
var fairyStockfish

function exportMapToCsv() {
    end = Date.now();
    let disabledFieldStr = ''
    jsonData.disabledFields.forEach(disabledField => disabledFieldStr += ' '+disabledField)
    disabledFieldStr = disabledFieldStr.trim()
    let csvContent = `${jsonData.fen},${jsonData.maxRank},${jsonData.maxFile},${disabledFieldStr },${jsonData.flagRegion}\n`
    matrix.forEach((value, key) => {
        csvContent += `${key},${value}\n`
    })
    csvContent = csvContent.slice(0, -1)
    fs.writeFile('./stockfish-log.txt', log, function(err) {
        if(err) {
            return console.log(err)
        }
    })
    fs.writeFile(jsonData.outputPath+"/"+jsonData.levelName+".csv", csvContent, function(err) {
        if(err) {
            return console.log(err)
        }
        console.log("csv successfully generated")
        console.log(`execution time: ${end - start} ms`)
    })
}


function callNextInStack(immidiatly) {
    if(callStack.length == 0) { 
        console.log('-----------end---------------')
        console.log(matrix)
        fairyStockfish.stdin.end()
        exportMapToCsv()
    }
    else {
        const val = callStack.pop()
        run(val)
    }
}

// helper functions for data
function getMoves(data) {
    const lines = data.toString().split('\n')
    const moves = []
    lines.forEach(l => {
        const temp = l.split(':')
        if(temp.length > 1) moves.push(temp[0])
    })
    if(moves[moves.length-1] == "Nodes searched") moves.pop()
    return moves
}

function getBestMove(data) {
    return data.toString().split('bestmove ')[1].split(' ')[0].trim()
}

function getFenPos(data) {
    const lines = data.toString().split('\n')
    const fen = lines.filter(l => l.startsWith('Fen'))[0]
    const fenPos = fen.split(' ')[1]
    return fenPos
}

function getActivePlayer(data) {
    const lines = data.toString().split('\n')
    const fen = lines.filter(l => l.startsWith('Fen'))[0]
    return fen.split(' ')[2]
}

function run(command) {
    log += `======================= input =======================\n${command}\n=====================================================\n`
    fairyStockfish.stdin.write(command)
}

function makeCsv() {
    start = Date.now();
    fairyStockfish = spawn('./stockfish')
    fairyStockfish.stdout.on('data', (data) => {
        log += data.toString()
        if(data.toString().includes('Fen: ')) {
            // handle 'd' output
            const activePlayer = getActivePlayer(data)
            currentFen = getFenPos(data)

            if(activePlayer === 'b') {
                // handle output of d when active player is black
                if(getFenPos(data).includes('a')) { // if 'a' (player) is not included, then player lost
                    run('ucinewgame\ngo perft 1\n')
                } else callNextInStack()
            } else {
                // handle output of d when active player is white
                if(matrix.has(currentFen)) callNextInStack()
                else {
                    run('go depth 50\n')
                }
            }
        } else if(data.toString().includes('Nodes searched:')) {
            // handle 'go perft 1' output
            currentMoves = getMoves(data)
            currentMoves.forEach(move => {
                // if move is not a winning move add it to the stack to evaluate it
                if(!jsonData.flagRegion.includes(move.substring(2, 4))) callStack.push(`ucinewgame\nposition fen "${currentFen} b - - 0 1" moves ${move}\nd\n`)
            })
            callNextInStack()
        } else if(data.toString().includes(': 1')) {
            // handle 'go perft 1' output, but if it is just a substring and does not contain Nodes searched
            currentMoves = getMoves(data)
            log += 'moves saved xxx:'
            currentMoves.forEach(move => {
                // if move is not a winning move add it to the stack to evaluate it
                log += move + ', '
                if(!jsonData.flagRegion.includes(move.substring(2, 4))) callStack.push(`ucinewgame\nposition fen "${currentFen} b - - 0 1" moves ${move}\nd\n`)
            })
            log += '\n'
        } else if(data.toString().includes('bestmove')) {
            // handle 'go depth'
            const bestMove = getBestMove(data)

            if(bestMove.includes('(none)') || bestMove.substring(0, 2) == bestMove.substring(2, 4)) {
                if(!fensWhereWhiteSkips.includes(currentFen)) {
                    fensWhereWhiteSkips.push(currentFen)
                    run(`ucinewgame\nposition fen "${currentFen} b - - 0 1"\nd\n`)
                } else {
                    callNextInStack()
                }
            } else { 
                matrix.set(currentFen, bestMove.slice(0,4))
                run(`ucinewgame\nposition fen "${currentFen} w - - 0 1" moves ${bestMove}\nd\n`)
            }
        }
    })

    // Algorithm starts
    run("load output/variants.ini\n")
    run("uci\n")
    run("setoption name Use NNUE value false\n")
    run("setoption name UCI_Variant value 1RhythmChess\n")
    run("setoption name Threads value 1\n")
    run('position startpos\nd\n')
}

module.exports.makeCsv = makeCsv