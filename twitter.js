import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)

function convertToMilliseconds(dateStr) {
  let dateObj = new Date(dateStr)
  let dateMS = dateObj.getTime()
  return dateMS
}

function millisecondsUntil(dateStr) {
  let milliseconds = convertToMilliseconds(dateStr)
  return milliseconds - Date.now()
}

function postScheduledTweetWithoutMedia(body, date, twitterClient, database) {
  setTimeout(() => {
    twitterClient?.v2
      .tweet(body) // optional chaining needed to prevent nasty error when authentication is not completed yet when server starts running
      .then(async (tweet) => {
        console.log('tweet sent', tweet)
        await database.deleteOne({ body: body, date: date })
        console.log('Scheduled tweet deleted from database')
      })
      .catch((error) => {
        console.log('error sending tweet', error)
      })
  }, millisecondsUntil(date))
}

function postScheduledTweetWithMedia(
  body,
  image,
  date,
  twitterClient,
  database
) {
  setTimeout(async () => {
    const imageData = Buffer.from(image, 'base64')
    const fileName = `image_${Date.now()}.png`
    const filePath = path.resolve(path.join(__dirname, 'temp', fileName))
    fs.writeFileSync(filePath, imageData)
    const uploadedMedia = await twitterClient?.v1.uploadMedia(filePath, {
      mimeType: 'image/png',
    })
    fs.unlinkSync(filePath)

    const params = {
      status: body,
      media_ids: uploadedMedia,
    }

    const simulatePostTweet = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(params)
        }, 1500)
      })
    }

    try {
      const tweet = await simulatePostTweet()
      console.log('Scheduled tweet posted:', tweet)
      await database.deleteOne({ body: body, image: image, date: date })
      console.log('Scheduled tweet deleted from database')
    } catch (error) {
      console.error('Error creating tweet:', error)
    }
  }, millisecondsUntil(date))
}

export default {
  millisecondsUntil,
  postScheduledTweetWithoutMedia,
  postScheduledTweetWithMedia,
}
