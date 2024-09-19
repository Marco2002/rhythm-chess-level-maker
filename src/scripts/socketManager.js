const hrefData = window.location.href.split('/')
const ip = hrefData[2].split(':')[0]
let evaluationRequestStack = [];

let socket = null;
let evaluateOverflow = false;

function connect() {
    socket = new WebSocket(`ws://${ip}:8080`);
    
    socket.onopen = function() {
        console.log("connection established")
        socket.send("connection established");
    }

    socket.onclose = function() {
        console.log("socket disconnected")
        connect()
    }

    socket.onerror = (err) => {console.log(err)}
    socket.onmessage = (message) => {console.log(message); console.log('no callback set')}
}

connect();

function destructMessageAndResolve(resolve) {
    return (message) => {
        const result = JSON.parse(message.data)
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
        evaluationRequestStack.push({config, resolve, reject})
    }) 
}

export function requestGenerate(config) {
    socket.send('gen ' + JSON.stringify(config))
}

export function requestMovelist(config) {
    socket.send('mov ' + JSON.stringify(config))
    return new Promise((resolve, reject) => {
        socket.onmessage = destructMessageAndResolve(resolve)
        socket.onerror = logAndReject(reject)
    })
}

function makeEvaluationRequest() {
    if(evaluationRequestStack.length == 0) return;
    const {config, resolve, reject} = evaluationRequestStack.pop();
    evaluationRequestStack = []
    socket.send('evl ' + JSON.stringify(config))
    evaluationRequestStack.forEach(evalData => {
        evalData.reject()
    })
    socket.onmessage = destructMessageAndResolve(resolve)
    socket.onerror = logAndReject(reject)
}

setInterval(makeEvaluationRequest, 1000)