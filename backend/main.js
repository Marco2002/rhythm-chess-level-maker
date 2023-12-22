import { WebSocketServer } from 'ws'
import makeIni from "./scripts/makeIni.js"
import evaluate from "./scripts/positionEvaluator.js";

// const { makeCsv } = require("./scripts/csvMaker")


// const fs = require('fs');

// makeIni()
// const lastScore = evaluate()
// makeCsv()

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(msg) {
    console.log('received: %s', msg);

    if(msg.toString().startsWith('evl')) {
      const config = JSON.parse(msg.toString().substring(4))
      makeIni(config).then(() => {
        evaluate().then((res) => {
          if(res.split(' ')[0] == 'mate' && parseInt(res.split(' ')[1]) > 0) {
            console.log('winnable')
          }
        })
      }).catch(console.log)
    }
  }); 
});
