import { useStore } from "@/store"
let evaluationRequestStack = []
let socket = null

function connect() {
    socket = new WebSocket(
        `${import.meta.env.VITE_USE_WSS == "true" ? "wss" : "ws"}://${import.meta.env.VITE_IP_ADDRESS}:8080`,
    )

    socket.onopen = function () {
        console.log("connection established")
        socket.send("connection established")
        const store = useStore()
        store.setup()
    }

    socket.onclose = function () {
        console.log("socket disconnected")
        connect()
    }

    socket.onerror = (err) => {
        console.log(err)
    }
    socket.onmessage = (message) => {
        console.log(message)
        console.log("no callback set")
    }
}

connect()

function destructMessageAndResolve(resolve) {
    return (message) => {
        const result = JSON.parse(message.data.toString())
        resolve(result)
    }
}

function logAndReject(reject) {
    return (error) => {
        console.error(error)
        reject(error)
    }
}

export function requestEvaluate(config) {
    return new Promise((resolve, reject) => {
        evaluationRequestStack.push({ config, resolve, reject })
    })
}

export function requestGenerate(config) {
    socket.send("gen " + JSON.stringify(config))
}

export function requestSave(config) {
    socket.send("sav " + JSON.stringify(config))
    return new Promise((resolve, reject) => {
        socket.onmessage = (msg) => {
            console.log(msg)
            resolve()
        }
        socket.onerror = logAndReject(reject)
    })
}

export function requestGetLevels() {
    socket.send("get")
    return new Promise((resolve, reject) => {
        socket.onmessage = destructMessageAndResolve(resolve)
        socket.onerror = logAndReject(reject)
    })
}

function makeEvaluationRequest() {
    if (evaluationRequestStack.length == 0) return
    const { config, resolve, reject } = evaluationRequestStack.pop()
    evaluationRequestStack = []
    socket.send("evl " + JSON.stringify(config))
    evaluationRequestStack.forEach((evalData) => {
        evalData.reject()
    })
    socket.onmessage = destructMessageAndResolve(resolve)
    socket.onerror = logAndReject(reject)
}

setInterval(makeEvaluationRequest, 1000)
