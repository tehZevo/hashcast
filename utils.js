var sha256 = require("crypto-js/sha256");
var crypto = require("crypto-js");
const concatTypedArray = require('arraybuffer-concat');

//thanks https://stackoverflow.com/questions/15761790/convert-a-32bit-integer-into-4-bytes-of-data-in-javascript/37863115
function toBytesInt32 (num) {
    arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return arr;
}

function hashMessage(message)
{
  var plain = concatTypedArray(
    toBytesInt32(message.time),
    toBytesInt32(message.nonce),
    message.data
  );

  hash = sha256(crypto.lib.WordArray.create(plain));
  hash = BigInt("0x"+hash); //TODO: avoid string conversion?

  return hash.toString(16).padStart(64, "0");
}

//TODO: for now, measure difficulty in "0s" (0-64)
function mine(data, difficulty)
{
  //32bit nonce, message
  var nonce = 0;
  var foundHash = false;

  //make some zeros, fill rest with fs
  var maxHash = [...Array(difficulty).keys()].map((e) => "0").join("").padEnd(64, "f");
  console.log(maxHash)

  var message = null;

  while(!foundHash)
  {
    message = {
      time: Date.now(),
      nonce: nonce,
      data: data
    }

    var hash = hashMessage(message);

    console.log("try", hash);

    if(BigInt("0x"+hash) <= BigInt("0x" + maxHash))
    {
      foundHash = true;
      break;
    }

    nonce++;
    nonce = nonce % (2**32);
  }

  return message;
}

module.exports = {mine, hashMessage};
