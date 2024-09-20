import fs from "fs/promises"

const filePath = "./backend/levels.json"

export default function saveLevel(levelData) {
    return fs.readFile(filePath, "utf8").then((data) => {
        let jsonArray = JSON.parse(data)
        let index = jsonArray.findIndex(
            (obj) => obj.levelName === levelData.levelName,
        )
        if (index !== -1) {
            jsonArray[index] = levelData
        } else {
            jsonArray.push(levelData)
        }
        return fs.writeFile(filePath, JSON.stringify(jsonArray), "utf8")
    })
}
