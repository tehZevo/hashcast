//generate keypair
var kp = HashCast.utils.generateKeypair();

//mint a stamp
var stamp = HashCast.Stamp.mint(kp.publicKey, "9999999999999999999999999999999999999999999999999999999999999");
console.log("stamp:");
stamp.print();
console.log("stamp is valid: " + stamp.verify());
console.log();

//create data
var data = "Hello World!";
data = HashCast.utils.nacl.util.decodeUTF8(data);

//create and sign message with stamp
var message = new HashCast.Message(data, stamp);
message.sign(kp.secretKey)
console.log("message:");
message.print();
console.log("message is valid: " + message.verify());
console.log();

//save to bytes
var validMessageBytes = message.toUint8Array();

//sign message with a different pubkey
console.log("signing with a different key...");
message.sign(HashCast.utils.generateKeypair().secretKey);
console.log("message is valid: " + message.verify());
console.log();

console.log("restoring old message from bytes...");
message = HashCast.Message.fromUint8Array(validMessageBytes);
console.log("old message is valid: " + message.verify());
