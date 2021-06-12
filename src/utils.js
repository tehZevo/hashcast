var nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
var concatTypedArray = require('arraybuffer-concat');
var Buffer = require("buffer").Buffer;

//thanks https://stackoverflow.com/questions/15761790/convert-a-32bit-integer-into-4-bytes-of-data-in-javascript/37863115
function toBytesInt32(num) {
    arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return arr;
}

function uint8toInt(bytes)
{
  var view = new DataView(bytes.buffer);
  return view.getUint32(0, false);
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** hash as uint8array */
function hashToBigInt(hash)
{
  return BigInt("0x" + uint8hex(hash));
}

function hex2uint8(hex)
{
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

function uint8hex(buf)
{
  return Buffer.from(buf).toString("hex");
}

function concatUint8Arrays(arrays)
{
  return new Uint8Array(concatTypedArray(...arrays));
}

function generateKeypair()
{
  return nacl.sign.keyPair();
}

function compareHashes(a, b)
{
  a = BigInt("0x" + a);
  b = BigInt("0x" + b);
  return a < b ? -1 : a > b ? 1 : 0;
}

/** unix timestamp */
function time()
{
  return Math.floor(Date.now() / 1000);
}

module.exports = {toBytesInt32, buf2hex, hex2uint8, concatUint8Arrays, uint8toInt, uint8hex, hashToBigInt, generateKeypair, nacl, compareHashes, time};
