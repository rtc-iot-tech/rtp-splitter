const port = 25000;
const dgram = require("dgram");
const splitter = dgram.createSocket("udp4")

const pairPtPort = {
  111: 5002,  // opus
  100: 25004   // h264
};
const dest = '127.0.0.1'

function getPayloadType( buf ) {
  const itr = buf.entries();

  const b0 = itr.next();
  const b1 = itr.next();
  const pt = b1.value[1] & 0x7f;

  return pt;
}

splitter.on("listening", () => {
  const addr = splitter.address();
  console.log(`splitter listening on ${addr.address}:${addr.port}`);
});

splitter.on("message", (buf, rinfo) => {
  const pt = getPayloadType(buf);

  const port = pairPtPort[pt];

  if(port) {
    splitter.send( buf, 0, buf.length, port, dest, ( err, bytes ) => {
      if( err ) console.warn(err.message);
      else console.log( `sent: ${port} ${bytes} - ${pt}` );
    });
  }
});

splitter.on("err", err => {
  console.warn( err );
  splitter.close();
});

splitter.on("close", () => {
  console.log("closed.");
});

splitter.bind( port );
