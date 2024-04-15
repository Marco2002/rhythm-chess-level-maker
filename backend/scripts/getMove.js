import {spawn} from 'child_process'

const depth = 30

export default function getMove() {
    const fairyStockfish = spawn('./backend/stockfish')
    // Input
    fairyStockfish.stdin.write("load backend/output/variants.ini\n");
    fairyStockfish.stdin.write("uci\n");
    fairyStockfish.stdin.write("setoption name UCI_Variant value 1RhythmChess\n");
    fairyStockfish.stdin.write('position startpos\n');
    fairyStockfish.stdin.write(`go depth ${depth}\n`);
    console.log('finding best move')
    // Output

    return new Promise((resolve, reject) => {
        fairyStockfish.stdout.on('data', (data) => {
            if(data.toString().includes('bestmove ')) {
                const moveLine = data.toString().split('\n').filter(s => s.includes('bestmove '))[0]
                const lineSegments = moveLine.split(' ')
                let result = {}
                result.bestmove = lineSegments[1].substring(0, 4)
                if(lineSegments.length > 2) result.ponder = lineSegments[3].substring(0, 4),
                
                fairyStockfish.stdin.end()
                fairyStockfish.kill()
                resolve(result)
            }
        })   
    })
    
}