var readline = require('readline');
const WebSocket = require('ws');
var { Command } = require('commander');

var HashCast = require("../src/HashCast.js");
var U = require("../src/utils.js");

const program = new Command();
program.version('0.0.0');

//TODO: arg for disallowing rebroadcast from client

program
  .option("-l, --lighthouses [lighthouses...]", "lighthouse urls", [])
  .option("-b, --block-size <number>", "block size (bytes)", 1024, parseInt)
  .option("-t, --max-time <number>", "max time difference (in both directions) in seconds", 60, parseInt)
  .option("-m, --mempool <number>", "max blocks in mempool", 1000, parseInt)
  .option("-d, --discard <number>", "max hashes in discard pile", 1000000, parseInt)
  .parse(process.argv);

//connect to all lighthouses
var lighthouses = program.lighthouses.map((e) => new WebSocket(e));

//callback for broadcasting
async function send(message)
{
  var hash = U.hashMessage(message);
  console.log("broadcasting message with hash", hash);

  //send to all lighthouses
  //TODO: arg for not rebroadcasting
  lighthouses.forEach((e) => e.send(JSON.stringify(message)));

  console.log("done broadcast");
}

async function receive(message)
{
  console.log(">> got message:", message.data);
}

lighthouses.forEach((e) =>
{
  e.on("message", (message) =>
  {
    caster.onMessage(JSON.parse(message));
  });

  e.on("error", (error) =>
  {
    console.log(error);
  });

  e.on("open", (e) =>
  {
    console.log("connected to", e);
  });

  e.on("close", (e) =>
  {
    console.log("disconnected from", e);
  });
})

//create caster
var caster = new HashCast(
  program.blockSize,
  program.maxTime,
  program.mempool,
  program.discard,
  receive,
  send
);

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
