var Message = require("./Message.js");
var Stamp = require("./Stamp.js");
var U = require("./utils.js");

class HashCast
{
  constructor(maxMessageSize, maxTime, mempoolSize, seenSize, cbReceive, cbSend, updateTime=100)
  {
    this.mempool = [];
    //TODO: make this an object/set or something
    this.seen = [];

    this.maxTime = maxTime;
    this.maxMessageSize = maxMessageSize;
    this.mempoolSize = mempoolSize;
    this.seenSize = seenSize;

    //function to call when a valid message is received
    this.cbReceive = cbReceive;

    //function to call when a new message is ready to be broadcast
    this.cbSend = cbSend;

    this.updateTime = updateTime;

    this.update();
  }

  /** mines a stamp and sends a message */
  send(data, keypair)
  {
    //get current difficulty (TODO: some kind of tolerance parameter for how aggressive to mine?)
    var difficulty = getDifficulty();

    //mine stamp
    var stamp = Stamp.mint(keypair.publicKey, difficulty);

    this.sendPremine(data, stamp, keypair);
  }

  /** send with a premined stamp */
  sendPremine(data, stamp, keypair)
  {
    //create and sign message
    var message = new Message(data, stamp);
    message.sign(kp.secretKey);

    //encode
    message = message.toUint8Array();
    message = HashCast.utils.uint8hex(message);

    //trigger onmessage as if we are seeing a new message
    this.onMessage(message);
  }

  addToSeen(hash)
  {
    //add to front so hopefully searching duped messages will be faster
    this.seen.unshift(hash);

    //TODO: sort and filter by time

    //remove old hashes
    while(this.seen.length > this.seenSize)
    {
      this.seen.pop();
    }
  }

  addToMempool(message)
  {
    //add message to mempool
    this.mempool.push(message);

    //sort ascending according to hash (lower hashes = stronger)
    this.mempool.sort((a, b) => U.compareHashes(a.hash, b.hash));

    //TODO: filter by time

    //trim off other messages
    while(this.mempool.length > this.mempoolSize)
    {
      this.mempool.pop();
    }
  }

  onMessage(message)
  {
    //parse message
    message = Message.fromUint8Array(U.hex2uint8(message));

    //grab hash
    var hash = message.stamp.getHashHex();

    //check that stamp hash and message sig are valid
    if(!message.verify())
    {
      console.log("message hash or signature invalid");
      return;
    }

    //if message length > max block size, discard
    if(message.data.length > this.maxMessageSize)
    {
      console.log("message " + hash + " too big (size: " + message.data.length + ")");
      return;
    }

    //verify message time
    var dTime = Math.abs(U.time() - message.stamp.time) / 1000;
    if(dTime > this.maxTime)
    {
      console.log("message " + hash + " too old or from too far in the future");
      return;
    }

    //check seen pile
    if(this.seen.includes(hash))
    {
      console.log("already seen message " + hash);
      return;
    }

    //add to discard pile
    this.addToSeen(hash);

    //add to mempool
    this.addToMempool(message);

    if(this.cbReceive != null)
    {
      this.cbReceive(message);
    }

  }

  update()
  {
    //TODO: trim mempool/seen
    if(this.mempool.length == 0)
    {
      setTimeout(() => this.update(), this.updateTime);
      return;
    }

    //hashes should already be sorted
    var message = this.mempool.shift(); //remove first from mempool (strongest hash)

    if(this.cbSend != null)
    {
      this.cbSend(message);
    }

    console.log("mempool", this.mempool.length);

    setTimeout(() => this.update(), this.updateTime);
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
