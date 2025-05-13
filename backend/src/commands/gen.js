import makeCsv from "../util/csvMaker.js"
import csvToRcl from "../util/csvToRcl.js"

export default async function generate(stockfishInstance, config) {
    const start = Date.now()
    const matrix = new Map()
    const depth = 40
    let callStack = []
    let fensWhereWhiteSkips = []
    let currentFen

    // TODO: generate solution and assert that the move count it is the same as inital evaluation
    const getMoveMatrix = () =>
        new Promise((resolve) => {
            function callNextInStack() {
                if (callStack.length == 0) {
                    resolve(matrix)
                } else {
                    const { func, args, responseHandler } = callStack.pop()
                    func(...args).then(responseHandler)
                }
            }

            function handlePositionResponse(response) {
                currentFen = response.fen
                // handle output of position command
                if (response.activePlayer === "b") {
                    // handle output when active player is black
                    if (response.fen.includes("a")) {
                        // if 'a' (player) is not included, then player lost
                        stockfishInstance.goPerft().then(handleGoPerftResponse)
                    } else callNextInStack()
                } else {
                    // handle output of d when active player is white
                    if (matrix.has(response.fen)) callNextInStack()
                    else {
                        stockfishInstance.go(depth).then(handleGoResponse)
                    }
                }
            }

            function handleGoPerftResponse(moves) {
                moves.forEach((move) => {
                    // if move is not a winning move add it to the stack to evaluate it
                    if (!config.flagRegion.includes(move.substring(2, 4)))
                        callStack.push({
                            func: (...args) =>
                                stockfishInstance.position(...args),
                            args: [currentFen, "b", [move]],
                            responseHandler: handlePositionResponse,
                        })
                })
                callNextInStack()
            }

            function handleGoResponse(response) {
                const bestMove = response.bestMove
                if (bestMove.includes("(none)")) {
                    // if no move is possible, then player lost
                    callNextInStack()
                } else if (
                    bestMove.substring(0, 2) == bestMove.substring(2, 4)
                ) {
                    if (!fensWhereWhiteSkips.includes(currentFen)) {
                        matrix.set(currentFen, bestMove.slice(0, 4))
                        fensWhereWhiteSkips.push(currentFen)
                        stockfishInstance
                            .position(currentFen, "b")
                            .then(handlePositionResponse)
                    } else {
                        callNextInStack()
                    }
                } else {
                    matrix.set(currentFen, bestMove.slice(0, 4))
                    stockfishInstance
                        .position(currentFen, "w", [bestMove])
                        .then(handlePositionResponse)
                }
            }

            stockfishInstance.setConfig(config).then(() => {
                stockfishInstance
                    .position("startpos")
                    .then(handlePositionResponse)
            })
        })

    const getSoltuion = async () => {
        stockfishInstance.reset()
        let solutionLengthEstimate = 0
        const solution = []
        let currentFen = (await stockfishInstance.position("startpos", "b")).fen

        return new Promise((resolve) => {
            async function handlePlayerTurn() {
                const { bestMove, minMoves } = await stockfishInstance.go(depth)
                if (!solutionLengthEstimate) solutionLengthEstimate = minMoves
                solution.push(bestMove)
                stockfishInstance.reset()
                currentFen = (
                    await stockfishInstance.position(currentFen, "b", [
                        bestMove,
                    ])
                ).fen
                handleCpuTurn()
            }

            async function handleCpuTurn() {
                const cpuMove = matrix.get(currentFen)
                if (!cpuMove) {
                    if (solution.length !== solutionLengthEstimate) {
                        console.error(
                            "solution length not the same as estimate",
                        )
                    }
                    console.log("solution length: ", solution.length)
                    console.log(
                        "solution length estimate: ",
                        solutionLengthEstimate,
                    )
                    resolve(solution)
                    return
                }
                currentFen = (
                    await stockfishInstance.position(currentFen, "w", [cpuMove])
                ).fen
                handlePlayerTurn()
            }

            handlePlayerTurn()
        })
    }

    await getMoveMatrix()
    config.solution = await getSoltuion()
    config.matrix = matrix
    await makeCsv(config)
    await csvToRcl(config.levelName)
    const end = Date.now()
    console.log("execution time: ", end - start)
}
