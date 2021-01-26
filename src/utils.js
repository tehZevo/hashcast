var sha256 = require("sha.js").sha256;

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

  hash = new sha256();
  hash = hash.update(Buffer.from(plain)); //??
  hash = hash.digest("hex");
  hash = BigInt("0x"+hash); //TODO: avoid string conversion?

  return hash.toString(16).padStart(64, "0");
}

function mine(data, maxHash)
{
  //32bit nonce, message
  var nonce = 0;
  var foundHash = false;

  var message = null;

  while(!foundHash)
  {
    message = {
      time: Date.now(),
      nonce: nonce,
      data: data
    }

    var hash = hashMessage(message);

    // console.log("try", hash);

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
