#! /usr/bin/env node

var readline = require('readline');
var { Command } = require('commander');

var ProtoPost = require("protopost");
var protopostClient = ProtoPost.client;

var HashCast = require("../src/HashCast.js");
var U = require("../src/utils.js");

//TODO: use b64 byte arrays instead of strings...
//TODO: web interface

//protopost cli example, type messages into console to hash and broadcast to peers

const program = new Command();
program.version('0.0.0');

program
  .option('-p, --port <number>', "port", 3000, parseInt)
  .option("-n, --peers [peers...]", "peers", [])
  .option("-b, --block-size <number>", "block size (bytes)", 1024, parseInt)
  .option("-t, --max-time <number>", "max time difference (in both directions) in seconds", 60, parseInt)
  .option("-m, --mempool <number>", "max blocks in mempool", 1000, parseInt)
  .option("-d, --discard <number>", "max hashes in discard pile", 1000000, parseInt)
  .parse(process.argv);

//callback for broadcasting
async function send(message)
{
  var hash = U.hashMessage(message);
  console.log("broadcasting message with hash", hash);

  await Promise.all(program.peers.map((peer) => {
    console.log("sending to", peer);
    return protopostClient(peer, "/broadcast", message);
  }));

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
);

caster.on("send", send);
caster.on("receive", receive);

//automatically update every 100 ms
setInterval(() => caster.update(), program.updateTime);

//add protopost listener
new ProtoPost({
  broadcast: (data) => caster.receive(data)
}).start(program.port);

//interaction (sending messages)
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async function (line)
{
  if(line == "")
  {
    return;
  }

  //TODO: convert message to bytes?

  caster.sendMessage(line, caster.getDifficulty());
});
