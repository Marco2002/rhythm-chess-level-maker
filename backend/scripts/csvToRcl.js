import fs from "node:fs"

const charMapping = {
    fenend: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    a: 10,
    p: 11,
    n: 12,
    b: 13,
    r: 14,
    q: 15,
}

function encodeFen(fen, maxFile) {
    fen = fen.toLowerCase()
    const cFen = []
    let rankSize = 0
    for (let i = 0; i < fen.length; i++) {
        const c = fen.charAt(i)
        if (c === "/") {
            if (rankSize !== maxFile) {
                console.log("error: invalid rank size", fen)
            }
            rankSize = 0
        } else if (c >= "0" && c <= "9") {
            rankSize += parseInt(c)
            cFen.push(charMapping[c])
        } else {
            rankSize++
            cFen.push(charMapping[c])
        }
    }
    cFen.push(0) // end of fen
    return cFen
}

function encodeField(field, maxRank, maxFile) {
    if (field.length !== 2) console.log("error: invalid field", field)
    const file = field.charCodeAt(0)
    const rank = field.charAt(1)
    const encodedField = [maxFile - (file - 96), maxRank - rank]
    return encodedField
}

function encodeFields(fields, maxRank, maxFile) {
    const fieldsArr = fields.split(" ")
    let encodedFields = []
    fieldsArr.forEach((field) => {
        encodedFields = encodedFields.concat(
            encodeField(field, maxRank, maxFile),
        )
    })
    encodedFields.push(15)
    return encodedFields
}

function encodeMove(move, maxRank, maxFile) {
    if (move.length !== 4) console.log("error: invalid move", move)
    const encodedMove = [
        ...encodeField(move.substring(0, 2), maxRank, maxFile),
        ...encodeField(move.substring(2, 4), maxRank, maxFile),
    ]
    return encodedMove
}

function encodeFile(csvData) {
    const lines = csvData.split("\n")
    const headerData = lines.shift().split(",")
    const maxRank = parseInt(headerData[0])
    const maxFile = parseInt(headerData[1])

    // encode header
    const encodedData = [
        maxRank, // maxRank
        maxFile, // maxFile
        ...encodeFen(headerData[2], maxFile), // encoded Fen
        ...encodeFields(headerData[3], maxRank, maxFile), // encoded flagRegion
        ...encodeFields(headerData[4], maxRank, maxFile), // encoded disabled fields
    ]

    // encode move matrix
    lines.forEach((line) => {
        const [fen, move] = line.split(",")
        encodedData.push(...encodeFen(fen, maxFile))
        encodedData.push(...encodeMove(move, maxRank, maxFile))
    })

    // format in Uint8Array (combines two 4bit values into one 8bit value)
    const formatedData = new Uint8Array(Math.ceil(encodedData.length / 2.0))
    for (let i = 0; i < encodedData.length; i++) {
        const val = (encodedData[2 * i] << 4) + encodedData[2 * i + 1]
        formatedData[i] = val
    }

    return formatedData
}

export default function csvToRcl(levelName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(
            "./backend/output/" + levelName + ".csv",
            "utf8",
            (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                const encodedData = encodeFile(data)
                fs.writeFile(
                    "./backend/output/" + levelName + ".rcl",
                    Buffer.from(encodedData),
                    (err) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        console.log("rcl successfully generated")
                        resolve()
                    },
                )
            },
        )
    })
}
