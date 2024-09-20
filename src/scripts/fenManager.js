// const files = ["h", "g", "f", "e", "d", "c", "b", "a"]

// helper functions
export function fenToPosition(fen, height, width) {
    const position = Array.from({ length: height }).map(() =>
        Array.from({ length: width }).fill("none"),
    )
    let ranks = fen.split("/")
    for (let y = 0; y < height; y++) {
        let x = width - 1
        for (let i = 0; i < ranks[y].length; i++) {
            if (ranks[y][i] >= "0" && ranks[y][i] <= "9") {
                x -= parseInt(ranks[y][i])
            } else {
                position[height - 1 - y][x] = ranks[y][i]
                x--
            }
        }
    }
    return position
}

export function positionToFen(position) {
    let fen = ""
    for (let y = position.length - 1; y >= 0; y--) {
        fen += "/"
        let fieldsWithoutPiece = 0
        for (let x = position[0].length - 1; x >= 0; x--) {
            if (position[y][x] == "none") fieldsWithoutPiece++
            else {
                if (fieldsWithoutPiece > 0) fen += fieldsWithoutPiece
                fen += position[y][x]
                fieldsWithoutPiece = 0
            }
        }
        if (fieldsWithoutPiece > 0) fen += fieldsWithoutPiece
    }
    return fen.slice(1)
}

// translate a field in format 'b5' to format '34'
export function namedFieldToNumberedField(field, width) {
    const file = field[0]
    const rank = field[1]
    return `${width - (file.charCodeAt(0) - 96)}${rank * 1 - 1}`
}

// translate a field in format '34' to format 'b5'
export function numberedFieldToNamedField(field, width) {
    const file = field[0]
    const rank = field[1]
    return `${String.fromCharCode(96 + (width - file * 1))}${rank * 1 + 1}`
}
