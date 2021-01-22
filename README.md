# HashCast
Global ~~spam~~ broadcast network powered by proof of work.

# Installation
```
git clone https://github.com/tehzevo/hashcast
cd hashcast
npm install
```

# Usage
Start a p2p node listening on port 3000 and connected to example.com, example.org, and example.net:
```
npm run cli -- -p 3000 -n http://example.com http://example.org http://example.net
```
Type messages into the console to hash and broadcast messages to all peers

# TODO
* spec for message format (eg [time, nonce, data]); then pass these arrays around instead of json
  * perhaps include length of message + magic number at the start?
