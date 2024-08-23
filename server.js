import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import fs from 'fs'
import twitter from './twitter.js'
import { fileURLToPath } from 'url'
import { TwitterApi } from 'twitter-api-v2'
import open from 'open'
import session from 'express-session'
import mockTweets from './static/mock-tweets.js'
import mongoose from 'mongoose'
import ScheduledTweet from './database/tweet-schema.js'

const app = express()
const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)
let authClient

app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }))
app.use(express.static(path.join(__dirname, "static")))
app.use(express.json({limit: '25mb'}))
app.use(session({
  secret: 'weijfw832We93ijwed', // Random generated secret key
  resave: false,
  saveUninitialized: true
}))

async function connectToMongoDb() {
  mongoose.connect('mongodb+srv://tweebook:tweebookbot@tweebook.kzqacuw.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error)
  })
}

// Start server & listen on port 3000
app.listen(3000, async function () {
  console.log('Node listening on port 3000')
  connectToMongoDb()
})

// Get existing scheduled tweets in database and display on homepage
app.get('/', function (req, res) {

  ScheduledTweet.find({})
  .then((data) => {
    data.forEach(element => {
      if(element.image){
        twitter.postScheduledTweetWithMedia(element.body, element.image, element.date, authClient, ScheduledTweet)
      } else {
        twitter.postScheduledTweetWithoutMedia(element.body, element.date, authClient, ScheduledTweet)
      }
    })
    return data
  })
  .then((updatedData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ScheduledTweet.find({}))
      }, 5000) // Timer needed to give database enough time to process and delete the data from above's function
    })
  })
  .then((latestData) => {
    res.render('index',  {
      hashtag: null, 
      twitterData: null, 
      tweetbox: null,
      scheduledTweets: latestData
    })
  })
  .catch((error) => {
    console.error('Error getting existing scheduled tweets', error)
  })

})

// Set the view engine to render EJS templates
app.set('view engine', 'ejs')

// Twitter API 2.0 authorisation
let TwitterAuth = new TwitterApi({
  appKey: '',
  appSecret: '',
  access_token: '',
  access_token_secret: '',
})

function callback () {
  return 'http://localhost:3000/callback'
}

const authLink = await TwitterAuth.generateAuthLink(callback(), { linkMode: 'authorize' })
open(authLink.url)
const oauth_token_secret = authLink.oauth_token_secret

app.get('/callback', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query
  req.session.oauth_token_secret = oauth_token_secret  // Get the saved oauth_token_secret from session

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).send('You denied the app or your session expired!')
  }

  const client = new TwitterApi({
    appKey: '',
    appSecret: '',
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  })

  await client.login(oauth_verifier)
    .then(({ client: loggedClient, accessToken, accessSecret }) => {
      req.session.accessToken = oauth_token
      req.session.oauth_token_secret = oauth_token_secret
      authClient = loggedClient
      res.redirect('http://localhost:3000')
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'))
})
  
// Retrieve and display hashtag search results and scheduled tweets
app.post('/', async function (req, res) {

  if (req.body.hashtag !== null) {    
    // Simulate twitter API call with mock data
    const simulateTweetSearch = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(mockTweets)
        }, 1000) // Simulate 1 sec delay
      })
    }
    
    try {
      const searchResults = await simulateTweetSearch() 
      await ScheduledTweet.find({})
      .then((data) => {
      res.render('index', {
        hashtag: req.body.hashtag, 
        twitterData: searchResults,
        scheduledTweets: data,
        error: null
      })
    })
    } catch (error) {
      console.error('Error searching tweets:', error)
      res.status(500).send('Error searching tweets')
    }
  }
})

// Post tweets
app.post('/postTweet', async function (req, res) {

  if(req.body.image){
    const imageData = Buffer.from(req.body.image, 'base64')
    const fileName = `image_${Date.now()}.png` // generate a unique file name for the image
    const filePath = path.resolve(path.join(__dirname, 'temp', fileName)) // filepath to save the image temporarily
    fs.writeFileSync(filePath, imageData)
    const uploadedMedia = await authClient.v1.uploadMedia(filePath, { mimeType: 'image/png' })
    fs.unlinkSync(filePath) // remove temp image file once it's done uploading

    const params = {
      status: req.body.text,
      media_ids: uploadedMedia
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
      console.log('Tweet created:', tweet)
      res.send("success")
    } catch (error) {
      console.error('Error creating tweet:', error)
      res.send("error")
    }
  } else {
    authClient.v2.tweet(req.body.text)
    .then((tweet) => {
      console.log('tweet sent', tweet)
      res.send('success')
    })
    .catch((error) => {
      console.log('error sending tweet', error)
      res.send('error')
    })
  }
})


// Schedule tweets
app.post('/scheduleTweet', async function (req, res) {

  let tweet = req.body  
  try {
    const scheduledTweet = new ScheduledTweet({
      body: tweet.body,
      date: tweet.date,
      image: tweet.image
    })

    const existingScheduledTweets = await ScheduledTweet.find({})
    for (let element of existingScheduledTweets){
      if(element.body === tweet.body && element.date === tweet.date){
        console.log("repeated tweet");
        res.send("repeated");
        return false;
      }
    }
    await scheduledTweet.save()

    if(tweet.image) {
      twitter.postScheduledTweetWithMedia(tweet.body, tweet.image, tweet.date, authClient, ScheduledTweet)
    } else {
      twitter.postScheduledTweetWithoutMedia(tweet.body, tweet.date, authClient, ScheduledTweet)
    }
    res.send("success")
  } catch (err) {
    console.log('Error parsing', err)
    res.send("error")
  }
})

// Retweet tweet to profile when clicked 
app.get('/retweet', async function (req, res) {
  const simulateRetweet = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: req.query.id })
      }, 1500)
    })
  }

  try {
    const tweet = await simulateRetweet() 
    console.log('Retweeted')
    res.send({id: req.query.id, result: 'success'})
  } catch (error) {
    console.error('Error retweeting', error)
    res.send({result: 'error'})
  }
})

// Undo retweet 
app.get('/undoRetweet', async function (req, res) {
  const simulateUndoRetweet = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: req.query.id })
      }, 1500)
    })
  }

  try {
    const tweet = await simulateUndoRetweet() 
    console.log('Undo Retweet')
    res.send({id: req.query.id, result: 'success'})
  } catch (error) {
    console.error('Error undo retweet', error)
    res.send({result: 'error'})
  }
})

// Favorite tweet on profile when clicked 
app.get('/favtweet', async function (req, res) {
  const simulateFavoriteTweet = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: req.query.id })
      }, 1500)
    })
  }

  try {
    const tweet = await simulateFavoriteTweet() 
    console.log('Tweet favorited')
    res.send({id: req.query.id, result: 'success'})
  } catch (error) {
    console.error('Error favoriting tweet', error)
    res.send({result: 'error'})
  }
})

// Undo favorite tweet 
app.get('/undoFavTweet', async function (req, res) {
  const simulateUndoFavoriteTweet = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ id: req.query.id })
      }, 1500)
    })
  }

  try {
    const tweet = await simulateUndoFavoriteTweet() 
    console.log('Tweet un-favorited')
    res.send({id: req.query.id, result: 'success'})
  } catch (error) {
    console.error('Error undo favoriting tweet', error)
    res.send({result: 'error'})
  }
})


// Delete scheduled tweet
app.post('/deleteScheduledTweet', async function (req, res) {
  let tweetToDelete = req.body
  const body = tweetToDelete.body
  try {
    const result = await ScheduledTweet.deleteOne({ body: body, date: tweetToDelete.date })
    console.log(result)
    res.send('success')
  } catch (error) {
    console.error(error)
    res.send('error')
  }
})
