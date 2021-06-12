var nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
var concatTypedArray = require('arraybuffer-concat');
var U = require("./utils.js");
var Stamp = require("./Stamp.js");

class Message
{
  static SIG_SIZE_BYTES = 64;

  /** [stamp, sig, data] ; data last so we can just slice with known lengths */
  static fromUint8Array(r)
  {
    //grab stamp, sig, and data bytes
    var stampBytes = r.slice(0, Stamp.SIZE_BYTES);
    var sigBytes = r.slice(Stamp.SIZE_BYTES, Stamp.SIZE_BYTES + Message.SIG_SIZE_BYTES);
    var dataBytes = r.slice(Stamp.SIZE_BYTES + Message.SIG_SIZE_BYTES);

    // console.log(r.length, stampBytes.length, sigBytes.length, dataBytes.length);

    var stamp = Stamp.fromUint8Array(stampBytes);
    return new Message(dataBytes, stamp, sigBytes);
  }

  constructor(data, stamp, sig)
  {
    this.data = data;
    this.stamp = stamp;
    this.sig = sig;
  }

  /** sign this message with the given secret key; stores the resulting signature in this.sig; also returns the sig */
  sign(secretKey)
  {
    var messageArray = this.toUint8ArrayNoSig();

    this.sig = nacl.sign.detached(messageArray, secretKey);

    return this.sig;
  }

  /** returns true if this message is valud (stamp hash ok, sig ok) */
  verify()
  {
    if(!this.stamp.verify())
    {
      return false;
    }

    var msgstamp = this.toUint8ArrayNoSig();

    return nacl.sign.detached.verify(msgstamp, this.sig, this.stamp.pubkey);
  }

  toUint8ArrayNoSig()
  {
    return U.concatUint8Arrays([
      this.stamp.toUint8Array(),
      this.data
    ]);
  }

  toUint8Array()
  {
    return U.concatUint8Arrays([
      this.stamp.toUint8Array(),
      this.sig,
      this.data
    ]);
  }

  print()
  {
    this.stamp.print();
    console.log("sig   | " + U.buf2hex(this.sig));
    console.log("data  | " + U.buf2hex(this.data));
  }
}

module.exports = Message;
