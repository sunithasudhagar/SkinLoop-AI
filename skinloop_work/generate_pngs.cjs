const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, colorR, colorG, colorB) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    // CRC32
    let c = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    buf.writeInt32BE(~c, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height rows, each with 1 filter byte (0) + width * 3 bytes (RGB)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw a subtle border or center circle accent
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.35 && dist > width * 0.28) {
        // Rose ring
        rawData[pxOffset] = 226;
        rawData[pxOffset + 1] = 114;
        rawData[pxOffset + 2] = 130;
      } else if (dist <= width * 0.12) {
        // Center accent
        rawData[pxOffset] = 250;
        rawData[pxOffset + 1] = 248;
        rawData[pxOffset + 2] = 245;
      } else {
        // Warm Charcoal background
        rawData[pxOffset] = colorR;
        rawData[pxOffset + 1] = colorG;
        rawData[pxOffset + 2] = colorB;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 45, 40, 38));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 45, 40, 38));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 35, 30, 28));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 45, 40, 38));
console.log('Generated PWA PNG assets successfully!');
