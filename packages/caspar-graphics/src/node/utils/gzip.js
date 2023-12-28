const zlib = require('zlib')
const fs = require('fs-extra')

const zip = zlib.createGzip()

const gzip = (readPath, writePath) => {
  const readStream = fs.createReadStream(readPath)
  const writeStream = fs.createWriteStream(writePath)

  return new Promise((resolve, reject) => {
    readStream
      .pipe(zip)
      .pipe(writeStream)
      .on('finish', err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
  })
}

module.exports = { gzip }
