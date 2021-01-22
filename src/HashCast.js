var U = require("./utils.js");

//TODO: move to utils?
function compareHashes(a, b)
{
  //TODO: pretty costly, maybe store hashes in messages
  a = U.hashMessage(a);
  b = U.hashMessage(b);
  a = BigInt("0x" + a);
  b = BigInt("0x" + b);
  return a < b ? -1 : a > b ? 1 : 0;
}

class HashCast
{
  constructor(maxMessageSize, maxTime, mempoolSize, discardPileSize, cbReceive, cbSend)
  {
    this.mempool = [];
    //TODO: make this an object/set or something
    this.discardPile = [];

    this.maxTime = maxTime;
    this.maxMessageSize = maxMessageSize;
    this.mempoolSize = mempoolSize;
    this.discardPileSize = discardPileSize;

    //function to call when a message is received
    this.cbReceive = cbReceive;

    //function to call when a new message is ready to be broadcast
    this.cbSend = cbSend;

    this.update();
  }

  addToDiscard(hash)
  {
    //add to front so hopefully searching duped messages will be faster
    this.discardPile.unshift(hash);

    //remove old hashes
    while(this.discardPile.length > this.discardPileSize)
    {
      this.discardPile.pop();
    }
  }

  addToMempool(message)
  {
    //add message to mempool
    this.mempool.push(message);

    //sort ascending according to hash (lower hashes = stronger)
    this.mempool.sort(compareHashes);

    //trim off other messages
    while(this.mempool.length > this.mempoolSize)
    {
      this.mempool.pop();
    }
  }

  onMessage(message)
  {
    //TODO: gzip b64?

    //hash message
    var hash = U.hashMessage(message);

    //if message length > max block size, discard
    if(message.data.length > this.maxMessageSize)
    {
      console.log("message " + hash + " too big");

      return;
    }

    //verify message time
    var dTime = Math.abs(Date.now() - message.time) / 1000;
    if(dTime > this.maxTime)
    {
      console.log("message " + hash + " too old or from too far in the future");

      return;
    }

    //check discard pile
    if(this.discardPile.includes(hash))
    {
      console.log("already seen message " + hash);

      return;
    }

    //add to discard pile
    this.addToDiscard(hash);

    //add to mempool
    this.addToMempool(message);

    if(this.cbReceive != null)
    {
      this.cbReceive(message)
    }

  }

  /** mines and sends message */
  sendMessage(data, difficulty)
  {
    console.log("mining message, looking for hash under", difficulty)
    var message = U.mine(data, difficulty);

    //add to queue in the normal fashion
    this.onMessage(message);
  }

  update()
  {
    if(this.mempool.length == 0)
    {
      //TODO: make time configurable
      setTimeout(() => this.update(), 1000);

      return;
    }

    //hashes should already be sorted
    var message = this.mempool.shift(); //remove first from mempool (strongest hash)

    if(this.cbSend != null)
    {
      this.cbSend(message);
    }

    console.log("mempool", this.mempool.length);

    setImmediate(() => this.update());
  }

  getDifficulty()
  {
    //NOTE: this is a pretty naive way of difficulty estimation
    //it could cause a DOS if someone inputs a crazy high hash
    //but that might be "working as intended", idk.

    //get next message hash (strongest hash)
    var maxHash = [...Array(64).keys()].map((e) => "f").join("");
    if(this.mempool.length > 0)
    {
      maxHash = U.hashMessage(this.mempool[0]);
      //subtract 1 to beat current best hash
      maxHash = BigInt("0x" + maxHash) - BigInt("0x1");
      maxHash = maxHash.toString(16);
    }

    return maxHash;
  }
}

module.exports = HashCast;
