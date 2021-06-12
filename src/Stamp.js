var sha256 = require("sha.js").sha256;
var concatTypedArray = require('arraybuffer-concat');
var U = require("./utils.js");
var Buffer = require("buffer").Buffer;

//TODO: maybe dont store hash in the stamp during transfer?
//  autohash on create/mint; remove verify

class Stamp
{
  /** time + nonce + key + hash */
  static SIZE_BYTES = 4 + 4 + 32 + 32;

  static fromUint8Array(r)
  {
    //grab time[4], nonce[4], key[32], and hash[32] bytes
    var timeBytes = r.slice(0, 4);
    var nonceBytes = r.slice(4, 8);
    var keyBytes = r.slice(8, 8+32);
    var hashBytes = r.slice(8+32, 8+64);

    return new Stamp(
      keyBytes,
      U.uint8toInt(timeBytes),
      U.uint8toInt(nonceBytes),
      hashBytes
    );
  }

  /** mint a stamp for pubkey that meets a given target difficulty */
  static mint(pubkey, target)
  {
    var nonce = 0;

    while(true)
    {
      var stamp = new Stamp(pubkey, U.time(), nonce, null);
      var hash = stamp.calcHash();

      if(U.hashToBigInt(hash) <= BigInt("0x" + target))
      {
        stamp.hash = hash;
        return stamp;
      }

      nonce++;
      nonce = nonce % (2**32);
    }
  }

  constructor(pubkey, time, nonce, hash)
  {
    this.pubkey = pubkey;
    this.time = time;
    this.nonce = nonce;
    this.hash = hash;
  }

  /** returns true if the hash([pubkey, time, nonce]) == this.hash */
  verify()
  {
    return U.uint8hex(this.calcHash()) == U.uint8hex(this.hash);
  }

  calcHash()
  {
    var plain = this.toUint8ArrayNoHash();

    var hash = new sha256();
    hash = hash.update(Buffer.from(plain));
    hash = new Uint8Array(hash.digest());

    return hash;
  }

  getHashHex()
  {
    return U.uint8hex(this.hash);
  }

  toUint8Array()
  {
    return U.concatUint8Arrays([
      this.toUint8ArrayNoHash(),
      this.hash,
    ]);
  }

  toUint8ArrayNoHash()
  {
    return U.concatUint8Arrays([
      U.toBytesInt32(this.time),
      U.toBytesInt32(this.nonce),
      this.pubkey,
    ]);
  }

  print()
  {
    console.log("time  | " + U.buf2hex(U.toBytesInt32(this.time)));
    console.log("nonce | " + U.buf2hex(U.toBytesInt32(this.nonce)));
    console.log("key   | " + U.buf2hex(this.pubkey));
    console.log("hash  | " + U.buf2hex(this.hash));
  }
}

module.exports = Stamp;
