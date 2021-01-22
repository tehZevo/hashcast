var readline = require('readline');
var ProtoPost = require("protopost");
var express = require("express");
const { Command } = require('commander');
var app = express();
var U = require("./utils.js");

var protopostClient = ProtoPost.client;

var defaultDiff = 2;

const program = new Command();
program.version('0.0.0');

//TODO: use b64 byte arrays instead of strings...
//TODO: web interface
//TODO: lock ability to do work (hashMessage) to requests from localhost

program
  .option('-p, --port <number>', "port", 3000, parseInt)
  .option("-n, --peers [peers...]", "peers", [])
  .option("-b, --block-size <number>", "block size (bytes)", 1024, parseInt)
  .option("-t, --max-time <number>", "max time difference (in both directions) in seconds", 60, parseInt)
  .option("-m, --mempool <number>", "max blocks in mempool", 1000, parseInt)
  .option("-d, --discard <number>", "max hashes in discard pile", 1000000, parseInt)
  .parse(process.argv);

var peers = program.args;

var mempool = [];
//TODO: make this an object/set or something
var discardPile = [];

function addToDiscard(hash)
{
  //add to front so hopefully searching duped messages will be faster
  discardPile.unshift(hash);

  //remove old hashes
  while(discardPile.length > program.discard)
  {
    discardPile.pop();
  }
}

function addToMempool(message)
{
  //add message to mempool
  mempool.push(message);

  //sort ascending according to hash (lower hashes = stronger)
  mempool.sort(compareHashes);

  //trim off other messages
  while(mempool.length > program.mempool)
  {
    mempool.pop();
  }
}

function onMessage(message)
{
  //TODO: gzip b64?

  //hash message
  var hash = U.hashMessage(message);

  //if message length > max block size, discard
  if(message.data.length > program.blockSize)
  {
    console.log("message " + hash + " too big");

    return;
  }

  //verify message time
  var dTime = Math.abs(Date.now() - message.time) / 1000;
  if(dTime > program.maxTime)
  {
    console.log("message " + hash + " too old or from too far in the future");

    return;
  }

  //check discard pile
  if(discardPile.includes(hash))
  {
    console.log("already seen message " + hash);

    return;
  }

  //add to discard pile
  addToDiscard(hash);

  //add to mempool
  addToMempool(message);

  console.log(">> got message:", message.data);
}

function compareHashes(a, b)
{
  a = BigInt("0x" + a);
  b = BigInt("0x" + b);
  return a < b ? -1 : a > b ? 1 : 0;
}

//TODO: for now difficulty should be 0..64
function sendMessage(data, difficulty)
{
  var message = U.mine(data, difficulty);

  //add to queue in the normal fashion
  onMessage(message);
}

async function broadcast(message)
{
  var hash = U.hashMessage(message);
  console.log("broadcasting message with hash", hash);

  //send to all peers
  await Promise.all(program.peers.map((peer) => {
    console.log("sending to", peer);
    return protopostClient(peer, "/broadcast", message);
  }));

  console.log("done broadcast")
}

async function update()
{
  if(mempool.length == 0)
  {
    setTimeout(update, 1000);

    return;
  }

  //hashes should already be sorted
  var message = mempool.shift(); //remove first from mempool (strongest hash)

  await broadcast(message);

  setImmediate(update);
}

function getDifficulty()
{
  //TODO: another method, for now just return hash of first in queue
  if(mempool.length = 0)
  {
    return
  }
  return mempool[0]
}

update();

var api = new ProtoPost({
  // broadcast,
  // send: (e) => sendMessage(e.data, e.difficulty)
  broadcast: onMessage
});

app.use("/", api.router);

app.listen(program.port, () => console.log(`Listening on port ${program.port}!`))

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

  //TODO: convert to bytes?
  sendMessage(line, defaultDiff);
});
