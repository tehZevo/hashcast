#! /usr/bin/env node

var http = require("http");

const express = require('express');
const WebSocket = require('ws');
var { Command } = require('commander');
var ProtoPost = require("protopost");

var HashCast = require("../src/HashCast.js");
var U = require("../src/utils.js");

const program = new Command();
program.version('0.0.0');

//TODO: peers for protopost p2p
program
  .option('-p, --port <number>', "port", 3000, parseInt)
  .option("-n, --peers [peers...]", "peers", [])
  .option("-b, --block-size <number>", "block size (bytes)", 1024, parseInt)
  .option("-t, --max-time <number>", "max time difference (in both directions) in seconds", 60, parseInt)
  .option("-m, --mempool <number>", "max blocks in mempool", 1000, parseInt)
  .option("-d, --discard <number>", "max hashes in discard pile", 1000000, parseInt)
  .parse(process.argv);


function onMessage(message)
{
  caster.onMessage(message);
}

var api = new ProtoPost({
  //TODO api routes (stats, etc)
}, onMessage);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use("/", api.router);

wss.on('connection', function connection(ws, req) {
  console.log(req.socket.remoteAddress, "connected");
});

server.listen(program.port, () => {
  console.log(`HashCast Lighthouse listening at http://localhost:${program.port}`)
});

//callback for broadcasting
async function send(message)
{
  var hash = message.stamp.calcHash();
  hash = U.uint8hex(hash);
  console.log("broadcasting message with hash", hash);

  var messageAsHex = message.toUint8Array();
  messageAsHex = U.uint8hex(messageAsHex);

  //TODO: broadcast to lighthouse peers via protopost
  await Promise.all(program.peers.map((peer) => {
    console.log("sending to", peer);
    return protopostClient(peer, "/", messageAsHex);
  }));

  //yell at web clients too
  //send to all clients
  wss.clients.forEach(function each(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messageAsHex));
    }
  });

  console.log("done broadcast");
}

async function receive(message)
{
  // console.log(">> got message:", message.data);
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
