import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function makeCrcTable() {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
}
const CRC_TABLE = makeCrcTable()

function crc32(data) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

function u32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.concat([t, data])
  return Buffer.concat([u32(data.length), t, data, u32(crc32(crcBuf))])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = chunk('IHDR', Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])]))
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0
    for (let x = 0; x < size; x++) {
      row[1 + x * 3] = r
      row[2 + x * 3] = g
      row[3 + x * 3] = b
    }
    rows.push(row)
  }
  const idat = chunk('IDAT', deflateSync(Buffer.concat(rows)))
  const iend = chunk('IEND', Buffer.alloc(0))
  return Buffer.concat([sig, ihdr, idat, iend])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', createPNG(192, 0xd4, 0x00, 0x00))
writeFileSync('public/icons/icon-512.png', createPNG(512, 0xd4, 0x00, 0x00))
console.log('Icons generated: public/icons/icon-192.png, icon-512.png')
