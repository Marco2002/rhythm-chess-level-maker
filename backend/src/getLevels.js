import fs from "fs/promises"

const filePath = "./backend/levels.json"

export default function getLevels() {
    return fs.readFile(filePath, "utf8")
}
