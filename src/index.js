const dotenv = require('dotenv')
const md5 = require('md5')
const request = require('request')
const fs = require('fs')

dotenv.config()
const { API_KEY, API_SECRET, SESSION_KEY } = process.env

fs.readFile(__dirname + '/data/listing.csv', 'utf-8', (err, data) => {
  const tracks = data.split('\n')
  const results = []
  tracks.forEach((item, index) => {
    const parts = item.split(',')
    const artist = parts[0].trim()
    const track = parts[1].trim()
    const album = parts[2].trim()
    const timestamp = parts[3].trim()
    const timestampEpoch = new Date(timestamp).getTime() / 1000

    const rawSignature = `album${album}api_key${API_KEY}artist${artist}methodtrack.scrobblesk${SESSION_KEY}timestamp${timestampEpoch}track${track}${API_SECRET}`
    const apiSignature = md5(rawSignature)

    const payload = {
      album,
      artist,
      track,
      api_key: API_KEY,
      api_sig: apiSignature,
      method: 'track.scrobble',
      sk: SESSION_KEY,
      timestamp: timestampEpoch,
    }

    const scrobble = () => {
      request.post({
        url: 'https://ws.audioscrobbler.com/2.0/?format=json',
        form: payload,
      }, (err, httpResponse, body) => {
        results[index] = `${httpResponse.statusCode}\t ${JSON.stringify(body)}`
        if (index === tracks.length - 1) {
          setTimeout(() => {
            console.log(results)
          }, 1000)
        }
      })
    }

    setTimeout(scrobble, index * 100)
  })

})
