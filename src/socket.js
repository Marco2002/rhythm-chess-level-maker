const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function(e) {
    console.log("connection established")
    socket.send("connection established");
};



export function requestEvaluate(config) {
    socket.send('evl ' + JSON.stringify(config))
}

export function requestGenerate(config) {
    socket.send('gen ' + JSON.stringify(config))
}
