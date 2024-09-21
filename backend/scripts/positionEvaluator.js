import { spawn } from "child_process"

// a negative value in evaluation means black looses a posite means black wins
const depth = 40

export default function evaluate() {
    const fairyStockfish = spawn("./backend/stockfish")

    fairyStockfish.on("error", (err) => {
        console.error(`Failed to start subprocess: ${err}`)
    })

    fairyStockfish.on("exit", (code) => {
        console.log(`Child process exited with code ${code}`)
    })

    // Input
    fairyStockfish.stdin.write("load backend/output/variants.ini\n")
    fairyStockfish.stdin.write("uci\n")
    fairyStockfish.stdin.write(
        "setoption name UCI_Variant value 1RhythmChess\n",
    )
    fairyStockfish.stdin.write("position startpos\n")
    fairyStockfish.stdin.write(`go depth ${depth}\n`)
    console.log("evaluating")
    // Output

    return new Promise((resolve) => {
        fairyStockfish.stdout.on("data", (data) => {
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
                    let result = {}
                    fairyStockfish.stdin.end()
                    fairyStockfish.kill()
                    if (
                        lastScore.result == "mate" &&
                        parseInt(lastScore.numberOfMoves) > 0
                    ) {
                        result.winnable = true
                        result.minTurns = parseInt(lastScore.numberOfMoves)
                        result.solution = []
                        for (let i = 0; i < result.minTurns; i++) {
                            result.solution.push(
                                s.split(" ")[19 + 2 * i].slice(0, 4),
                            )
                        }
                        resolve(result)
                    } else {
                        result.winnable = false
                        resolve(result)
                    }
                })
            }
        })
    })
}
