import fs from 'fs'

export default function makeIni(config) {
    let mobilityRegion = ''
    for(let y = 0; y < config.maxRank; y++) {
        for(let x = 0; x < config.maxFile; x++) {
            mobilityRegion += ' ' + String.fromCharCode(97 + x) + (y+1)
        }
    }
    config.disabledFields.forEach(disabledField => {
        mobilityRegion = mobilityRegion.replace(disabledField, '')
    })

    mobilityRegion = mobilityRegion.replace(/\s\s+/g, ' ').trim()

    let flagRegionString = ''
    config.flagRegion.forEach(field => {
        flagRegionString += field+' '
    })
    flagRegionString = flagRegionString.trim()

    const variantsIni = `[1RhythmChess:chess]
customPiece1 = a:mcWceF
customPiece2 = p:mfWcfF
customPiece3 = b:F
customPiece4 = r:W
customPiece5 = q:WF
immobile = x

flagPiece = a
flagRegionBlack = ${flagRegionString}
extinctionValue = loss
extinctionPieceTypes = *
mobilityRegionWhiteKnight = ${mobilityRegion}
mobilityRegionBlackCustomPiece1 = ${mobilityRegion}
mobilityRegionWhiteCustomPiece2 = ${mobilityRegion}
mobilityRegionWhiteCustomPiece3 = ${mobilityRegion}
mobilityRegionWhiteCustomPiece4 =  ${mobilityRegion}
mobilityRegionWhiteCustomPiece5 = ${mobilityRegion}

immobilityIllegal = true

passBlack = true
passOnStalemateWhite = true

maxRank = ${config.maxRank}
maxFile = ${config.maxFile}

startFen = ${config.fen} ${ config.enemyTurn ? 'w' : 'b'} - - 0 1`

    return new Promise(function(resolve, reject) {
        fs.writeFile("./backend/output/variants.ini", variantsIni, function(err) {
            if(err) {
                reject(err)
            }
            console.log("variants.ini successfully generated");
            resolve()
        })
    })
}