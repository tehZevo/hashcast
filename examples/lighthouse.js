const WebSocket = require('ws');
var { Command } = require('commander');

var HashCast = require("../src/HashCast.js");
var U = require("../src/utils.js");

const program = new Command();
program.version('0.0.0');

program
  .option('-p, --port <number>', "port", 3000, parseInt)
  .option("-b, --block-size <number>", "block size (bytes)", 1024, parseInt)
  .option("-t, --max-time <number>", "max time difference (in both directions) in seconds", 60, parseInt)
  .option("-m, --mempool <number>", "max blocks in mempool", 1000, parseInt)
  .option("-d, --discard <number>", "max hashes in discard pile", 1000000, parseInt)
  .parse(process.argv);

const wss = new WebSocket.Server({ port: program.port });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    caster.onMessage(JSON.parse(message));
  });
});

console.log("listening on " + program.port);

//callback for broadcasting
async function send(message)
{
  var hash = U.hashMessage(message);
  console.log("broadcasting message with hash", hash);

  //send to all clients
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  console.log("done broadcast");
}

async function receive(message)
{
  console.log(">> got message:", message.data);
}

//create caster
var caster = new HashCast(
  program.blockSize,
  program.maxTime,
  program.mempool,
  program.discard,
  receive,
  send
);
