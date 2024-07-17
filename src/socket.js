const socket = new WebSocket('ws://localhost:8080');
let evaluateOverflow = false;

function destructMessageAndResolve(resolve) {
    return (message) => {
        const result = JSON.parse(message.data)
        resolve(result)
    }
}

socket.onopen = function(e) {
    console.log("connection established")
    socket.send("connection established");
}

socket.onerror = (err) => {console.log(err); console.log('no error callback set')}
socket.onmessage = (message) => {console.log(message); console.log('no callback set')}

export function requestEvaluate(config) {
    if(evaluateOverflow) 
        return new Promise((resolve, reject) => reject);
    evaluateOverflow = true
    socket.send('evl ' + JSON.stringify(config))
    return new Promise((resolve, reject) => {
        socket.onmessage = destructMessageAndResolve(resolve)
        socket.onerror = reject
    })
}

export function requestGenerate(config) {
    socket.send('gen ' + JSON.stringify(config))
}

export function requestAutomove(config) {
    socket.send('mov ' + JSON.stringify(config))
    return new Promise((resolve, reject) => {
        socket.onmessage = destructMessageAndResolve(resolve)
        socket.onerror = reject
    })
}

export function requestCpumove(config) {
    socket.send('cpu ' + JSON.stringify(config))
    return new Promise((resolve, reject) => {
        socket.onmessage = destructMessageAndResolve(resolve)
        socket.onerror = reject
    })
}

setInterval(() => evaluateOverflow = false, 1000)