import fs from "fs"

function removeXfromFen(fen) {
    let previousChar = fen.charAt(0)
    let outputFen = ""
    fen += "/"
    for (let i = 1; i < fen.length; i++) {
        let c = fen.charAt(i)
        let write = ""
        if (previousChar === "x") {
            if (c >= "0" && c <= "9") {
                previousChar = "" + parseInt(c)
            } else if (c !== "x") {
                write = "1"
                previousChar = c
            } else {
                // previous char and current char are 'x'
                previousChar = "2"
            }
        } else if (previousChar >= "0" && previousChar <= "9" && c === "x") {
            previousChar++
        } else if (
            previousChar >= "0" &&
            previousChar <= "9" &&
            c >= "0" &&
            c <= "9"
        ) {
            previousChar = "" + (parseInt(previousChar) + parseInt(c))
        } else if (c === "x") {
            write = previousChar
            previousChar = "1"
        } else {
            write = previousChar
            previousChar = c
        }
        outputFen += write
    }
    return outputFen
}

export default function makeCsv(data) {
    const start = Date.now()
    const jsonData = data
    let disabledFieldStr = ""
    jsonData.disabledFields.forEach(
        (disabledField) => (disabledFieldStr += " " + disabledField),
    )

    let flagRegionStr = ""
    jsonData.flagRegion.forEach(
        (flagField) => (flagRegionStr += " " + flagField),
    )
    let solutionStr = ""
    jsonData.solution.forEach((move) => (solutionStr += " " + move))
    flagRegionStr = flagRegionStr.trim()
    disabledFieldStr = disabledFieldStr.trim()
    solutionStr = solutionStr.trim()
    return new Promise((resolve) => {
        const end = Date.now()

        let csvContent = `${jsonData.maxRank},${jsonData.maxFile},${removeXfromFen(jsonData.fen)},${flagRegionStr},${disabledFieldStr},${solutionStr}\n`
        jsonData.matrix.forEach((value, key) => {
            csvContent += `${removeXfromFen(key)},${value}\n`
        })
        csvContent = csvContent.slice(0, -1)

        fs.writeFile(
            "backend/output/" + jsonData.levelName + ".csv",
            csvContent,
            function (err) {
                if (err) {
                    return console.log(err)
                }
                console.log("csv successfully generated")
                console.log(`execution time: ${end - start} ms`)
                resolve()
            },
        )
    })
}
