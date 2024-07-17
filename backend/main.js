import { WebSocketServer } from 'ws'
import makeIni from "./scripts/makeIni.js"
import evaluate from "./scripts/positionEvaluator.js";
import makeCsv from './scripts/csvMaker.js';
import getMove from './scripts/getMove.js';
import csvToRcl from './scripts/csvToRcl.js';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(msg) {
    console.log('received: %s', msg);
    if(msg.toString() === 'connection established') return;

    const config = JSON.parse(msg.toString().substring(4))

    if(msg.toString().startsWith('evl')) {
      makeIni(config).then(() => {
        return evaluate()
      }).then((res) => {
        ws.send(JSON.stringify(res))
      }).catch(console.log)
    }

    if(msg.toString().startsWith('gen')) {
      makeIni(config).then(() => {
        return makeCsv(config)
      }).then(() => {
        return csvToRcl(config.levelName)
      }).then((res) => {
        ws.send(JSON.stringify(res))
      }).catch(console.log)
    }

    if(msg.toString().startsWith('mov')) {
      makeIni(config).then(() => {
        return getMove(config)
      }).then((res) => {
        ws.send(JSON.stringify(res))
      }).catch(console.log)
    }
  }); 
});
