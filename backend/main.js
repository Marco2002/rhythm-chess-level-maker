import { WebSocketServer } from "ws"
import fs from "fs"
import https from "https"
import process from "node:process"
import makeIni from "./scripts/makeIni.js"
import evaluate from "./scripts/positionEvaluator.js"
import makeCsv from "./scripts/csvMaker.js"
import getMovelist from "./scripts/getMovelist.js"
import csvToRcl from "./scripts/csvToRcl.js"
import saveLevel from "./scripts/saveLevel.js"
import getLevels from "./scripts/getLevels.js"

// Load your SSL certificate and private key
const server = https.createServer({
    cert: fs.readFileSync("./backend/cert.pem"),
    key: fs.readFileSync("./backend/key.pem"),
})

// Create WebSocket Server using the `ws` module
const wss = new WebSocketServer({ server })

wss.on("connection", function connection(ws) {
    ws.on("error", console.log)
    ws.on("close", () => {
        console.log("Client disconnected")
    })

    ws.on("message", function message(msg) {
        console.log("received: %s", msg)
        if (msg.toString() === "connection established") return

        const config =
            msg.toString().length >= 5
                ? JSON.parse(msg.toString().substring(4))
                : {}

        if (msg.toString().startsWith("evl")) {
            makeIni(config)
                .then(() => {
                    return evaluate()
                })
                .then((res) => {
                    ws.send(JSON.stringify(res))
                })
                .catch(console.log)
        }

        if (msg.toString().startsWith("gen")) {
            makeIni(config)
                .then(() => {
                    return makeCsv(config)
                })
                .then(() => {
                    return csvToRcl(config.levelName)
                })
                .then((res) => {
                    ws.send(JSON.stringify(res))
                })
                .catch(console.log)
        }

        if (msg.toString().startsWith("mov")) {
            makeIni(config)
                .then(() => {
                    return getMovelist(config)
                })
                .then((movelistOpponent) => {
                    const res = JSON.stringify(
                        movelistOpponent,
                        (key, value) => {
                            if (value instanceof Map) {
                                const returnValue = {}
                                value.entries().forEach((e) => {
                                    returnValue[e[0]] = e[1]
                                })
                                return returnValue
                            } else {
                                return value
                            }
                        },
                    )
                    ws.send(res)
                })
                .catch(console.error)
        }

        if (msg.toString().startsWith("sav")) {
            saveLevel(config)
                .then(() => {
                    ws.send("level saved successfully")
                })
                .catch(console.error)
        }

        if (msg.toString().startsWith("get")) {
            getLevels()
                .then((data) => {
                    ws.send(data)
                })
                .catch(console.error)
        }
    })
})

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err)
    if (err.code === "EPIPE") {
        console.log("EPIPE handled globally, application will not crash.")
    }
})

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

// Server listens on port 443 (HTTPS)
server.listen(8080, () => {
    console.log("Server running on port 8080")
})
