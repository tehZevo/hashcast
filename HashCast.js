var ProtoPost = require("protopost");

var U = require("./utils.js");

var protopostClient = ProtoPost.client;

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
  constructor(maxMessageSize, maxTime, mempoolSize, discardPileSize, port)
  {
    this.peers = [];
    this.mempool = [];
    //TODO: make this an object/set or something
    this.discardPile = [];

    this.maxTime = maxTime;
    this.maxMessageSize = maxMessageSize;
    this.mempoolSize = mempoolSize;
    this.discardPileSize = discardPileSize;

    new ProtoPost({
      // broadcast,
      // send: (e) => sendMessage(e.data, e.difficulty)
      broadcast: (data) => this.onMessage(data)
    }).start(port);

    this.update();
  }

  addPeer(peer)
  {
    this.peers.push(peer);
  }

  removePeer(peer)
  {
    this.peers = this.peers.filter((e) => e != peer);
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

    console.log(">> got message:", message.data);
  }

  /** mines and sends message */
  sendMessage(data, difficulty)
  {
    console.log("mining message, looking for hash under", difficulty)
    var message = U.mine(data, difficulty);

    //add to queue in the normal fashion
    this.onMessage(message);
  }

  async broadcast(message)
  {
    var hash = U.hashMessage(message);
    console.log("broadcasting message with hash", hash);

    //send to all peers
    await Promise.all(this.peers.map((peer) => {
      console.log("sending to", peer);
      return protopostClient(peer, "/broadcast", message);
    }));

    console.log("done broadcast")
  }

  async update()
  {
    if(this.mempool.length == 0)
    {
      //TODO: make time configurable
      setTimeout(() => this.update(), 1000);

      return;
    }

    //hashes should already be sorted
    var message = this.mempool.shift(); //remove first from mempool (strongest hash)

    await this.broadcast(message);

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
