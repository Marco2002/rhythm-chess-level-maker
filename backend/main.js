import { WebSocketServer } from "ws"
import fs from "fs"
import https from "https"
import http from "http" // For unencrypted ws
import process from "node:process"
import makeIni from "./src/util/makeIni.js"
import evaluate from "./src/commands/evl.js"
import saveLevel from "./src/saveLevel.js"
import getLevels from "./src/getLevels.js"
import StockfishInstance from "./src/stockfishAPI.js"
import generate from "./src/commands/gen.js"

// Check environment variable to determine whether to use wss or ws
const useWSS = process.env.VITE_USE_WSS === "true"

let server

// Create the appropriate server based on the environment variable
if (useWSS) {
    server = https.createServer({
        cert: fs.readFileSync("./backend/cert.pem"),
        key: fs.readFileSync("./backend/key.pem"),
    })
    console.log("Using secure WebSocket server (wss)")
} else {
    server = http.createServer() // Unencrypted server for ws
    console.log("Using unencrypted WebSocket server (ws)")
}

// Create WebSocket Server using the `ws` module
const wss = new WebSocketServer({ server })

wss.on("connection", function connection(ws) {
    const stockfishInstance = new StockfishInstance()
    ws.on("error", console.log)
    ws.on("close", () => {
        console.log("Client disconnected")
    })

    ws.on("message", async (msg) => {
        console.log("received: %s", msg)
        if (msg.toString() === "connection established") return

        const config =
            msg.toString().length >= 5
                ? JSON.parse(msg.toString().substring(4))
                : {}

        if (msg.toString().startsWith("evl")) {
            const res = await evaluate(stockfishInstance, config)
            ws.send(JSON.stringify(res))
        }

        if (msg.toString().startsWith("gen")) {
            await generate(stockfishInstance, config)
            ws.send("generation complete")
        }

        // if (msg.toString().startsWith("mov")) {
        //     makeIni(config)
        //         .then(() => {
        //             return getMovelist(config)
        //         })
        //         .then((movelistOpponent) => {
        //             const res = JSON.stringify(
        //                 movelistOpponent,
        //                 (key, value) => {
        //                     if (value instanceof Map) {
        //                         const returnValue = {}
        //                         value.entries().forEach((e) => {
        //                             returnValue[e[0]] = e[1]
        //                         })
        //                         return returnValue
        //                     } else {
        //                         return value
        //                     }
        //                 },
        //             )
        //             ws.send(res)
        //         })
        //         .catch(console.error)
        // }

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

// Server listens on port 8080
server.listen(8080, () => {
    console.log(`Server running on port 8080 (${useWSS ? "wss" : "ws"})`)
})
