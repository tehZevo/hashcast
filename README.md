# HashCast
Global ~~spam~~ broadcast network powered by proof of work.

## Installation
```
git clone https://github.com/tehzevo/hashcast
cd hashcast
npm install
```

## Usage

### Start a p2p node listening on port 3000 and connected to example.com, example.org, and example.net:
```
npm run p2p-cli -- -p 3000 -n http://example.com http://example.org http://example.net
```
Type messages into the console to hash and broadcast messages to all peers

### Start a lighthouse (server) on port 3000:
```
npm run lightouse -- -p 3000
```

### Run the lighthouse client connected to example.com, example.org, and example.net:
```
npm run client-cli -- -l http://example.com http://example.org http://example.net
```
Messages can be sent similarly to p2p-cli. Additionally, messages will be rebroadcast to other servers

### Run a lighthouse in Docker on port 7979
```
docker build https://github.com/tehzevo/hashcast.git -t zevo/hashcast
docker run -d --restart unless-stopped -p 7979:7979 --name hashcast zevo/hashcast -p 7979
```

## TODO
* spec for message format (eg [time, nonce, data]); then pass these arrays around instead of json
  * perhaps include length of message + magic number at the start?
* separate lighthouse code from main hashcast repo
* do we need to store stamp hashes in transit? do we need to verify that the signer knew the hash?
* better difficulty determining algorithm
* scroll to bottom when message is received
