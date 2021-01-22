var readline = require('readline');
var { Command } = require('commander');
var HashCast = require("./HashCast.js");

//TODO: use b64 byte arrays instead of strings...
//TODO: web interface
//TODO: lock ability to do work (hashMessage) to requests from localhost

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

//create caster
var caster = new HashCast(
  program.blockSize,
  program.maxTime,
  program.mempool,
  program.discard,
  program.port
);

//add peers
program.peers.forEach((e) => caster.addPeer(e));

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
