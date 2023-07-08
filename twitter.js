import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

function convertToMilliseconds(dateStr) {
    let dateObj = new Date(dateStr);
    let dateMS = dateObj.getTime();
    return dateMS;
}

function millisecondsUntil(dateStr) {
    let milliseconds = convertToMilliseconds(dateStr);
    return milliseconds - Date.now();
}

function filterOldTweets(tweets){
    let updatedScheduledTweets = [];
    for(let i=0; i < tweets.length; i++) {
        let date = tweets[i].date;
        if(millisecondsUntil(date) > 0) {
            updatedScheduledTweets.push(tweets[i]);
        }   
    }
    return updatedScheduledTweets;
}

function postScheduledTweetWithoutMedia(body, date, twitterClient, file){
    setTimeout(() => {
        twitterClient?.v2.tweet(body) // optional chaining needed to prevent nasty error when authentication is not completed yet when server starts running
        .then((tweet) => {
          console.log('tweet sent', tweet)
          let updatedScheduledTweets = filterOldTweets(file);
          let content = JSON.stringify(updatedScheduledTweets);
          fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
        })
        .catch((error) => {
          console.log('error sending tweet', error)
        })
      }, millisecondsUntil(date));
}

function postScheduledTweetWithMedia (body, image, date, twitterClient, file) {
    setTimeout(async () => {
      const imageData = Buffer.from(image, 'base64');
      const fileName = `image_${Date.now()}.png`;
      const filePath = path.resolve(path.join(__dirname, 'temp', fileName));
      fs.writeFileSync(filePath, imageData);
      const uploadedMedia = await twitterClient?.v1.uploadMedia(filePath, { mimeType: 'image/png' });
      fs.unlinkSync(filePath);

      const params = {
        status: body,
        media_ids: uploadedMedia
      }

      const simulatePostTweet = async () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(params);
          }, 1500); 
        });
      };

      try {
      const tweet = await simulatePostTweet(); 
      console.log('Tweet created:', tweet);
      let updatedScheduledTweets = filterOldTweets(file);
      let content = JSON.stringify(updatedScheduledTweets);
      fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
      } catch (error) {
      console.error('Error creating tweet:', error);
      }
    }, millisecondsUntil(date));
}

function loadSchedulingFile() {
  let fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  let file = [];
  if(fileExists){
    let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
    file = JSON.parse(data);
  }
}

export default {millisecondsUntil, postScheduledTweetWithoutMedia, filterOldTweets, postScheduledTweetWithMedia, loadSchedulingFile};


