import {spawn} from 'child_process'

// a negative value in evaluation means black looses a posite means black wins
const depth = 20
let lastScore;

export default function evaluate() {
    const fairyStockfish = spawn('./backend/stockfish')
    // Input
    fairyStockfish.stdin.write("load output/variants.ini\n");
    fairyStockfish.stdin.write("uci\n");
    fairyStockfish.stdin.write("setoption name UCI_Variant value 1RhythmChess\n");
    fairyStockfish.stdin.write('position startpos\n');
    fairyStockfish.stdin.write(`go depth ${depth}\n`);
    console.log('evaluating')
    // Output

    return new Promise((resolve, reject) => {
        fairyStockfish.stdout.on('data', (data) => {
            if(data.toString().includes('info depth ')) {
                const infoStrings = data.toString().split('\n').filter(s => s.includes('score '))
                infoStrings.forEach(s => {
                    lastScore = s.split(' ')[8] + ' ' + s.split(' ')[9]
                    const currentDepth = s.split(' ')[2]
                    console.log(s + 'score: ' + lastScore)
                    if(currentDepth == depth) {
                        fairyStockfish.stdin.end()
                        resolve(lastScore)
                    }
                })
    
            }
        })   
    })
    
}