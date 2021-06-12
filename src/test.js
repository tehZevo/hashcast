var nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
var Stamp = require("./Stamp.js");
var Message = require("./Message.js");

//generate keypair
var kp = nacl.sign.keyPair();

//mint a stamp
var stamp = Stamp.mint(kp.publicKey, "999999999999999999999999999999999999999999999999999999999999");
console.log("stamp:");
stamp.print();
console.log("stamp is valid: " + stamp.verify());
console.log();

//create data
var data = "Hello World!";
data = nacl.util.decodeUTF8(data);

//create and sign message with stamp
var message = new Message(data, stamp);
message.sign(kp.secretKey)
console.log("message:");
message.print();
console.log(message);
console.log("message is valid: " + message.verify());
console.log();

//save to bytes
var validMessageBytes = message.toUint8Array();

//sign message with a different pubkey
console.log("signing with a different key...");
message.sign(nacl.sign.keyPair().secretKey);
console.log("message is valid: " + message.verify());
console.log();

console.log("restoring old message from bytes...");
message = Message.fromUint8Array(validMessageBytes);
message.print();
console.log(message);
console.log("old message is valid: " + message.verify());
