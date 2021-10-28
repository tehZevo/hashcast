//generate keypair
var kp = HashCast.utils.generateKeypair();

async function sendMessage(message)
{
  //just mine a bogus difficulty and send
  var stamp = HashCast.Stamp.mint(kp.publicKey, "9999999999999999999999999999999999999999999999999999999999999");
  message = HashCast.utils.nacl.util.decodeUTF8(message);
  message = new HashCast.Message(message, stamp);
  message.sign(kp.secretKey);
  // message = message.toUint8Array();
  // message = HashCast.utils.uint8hex(message);
  message = message.toHex();
  // console.log(message)

  await protopostClient("/", message);
}

function onMessage(message)
{
  message = JSON.parse(message); //lol string
  message = HashCast.utils.hex2uint8(message);
  message = HashCast.Message.fromUint8Array(message);
  var pubkeyhex = HashCast.utils.uint8hex(message.stamp.pubkey);

  //TODO: validate on client?
  app.messages.push({
    user: "Anon",
    data: new TextDecoder().decode(message.data),
    icon: `https://avatars.dicebear.com/api/bottts/${pubkeyhex}.svg`
  });
}
