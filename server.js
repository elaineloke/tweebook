import express from 'express'
import path, { parse } from 'path'
import twit from 'twit'
import bodyParser from 'body-parser'
import fs from 'fs'
import twitter from './twitter.js'
import { fileURLToPath } from 'url'
import { TwitterApi } from 'twitter-api-v2'
import open from 'open'
import session from 'express-session'
import mockTweets from './static/mock-tweets.js'

const app = express()
const filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(filename)
let authClient

app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }))
app.use(express.static(path.join(__dirname, "static")))
app.use(express.json({limit: '25mb'}))
app.use(session({
  secret: 'weijfw832We93ijwed', // random generated secret key
  resave: false,
  saveUninitialized: true
}))

// start server & listen on port 3000
app.listen(3000, function () {
  console.log('Node listening on port 3000')
  if(fs.existsSync(__dirname +'/tmp/scheduling.txt')) {
    let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8')
    const file = JSON.parse(data)

    file.forEach(element => {
      if(element.image){
        twitter.postScheduledTweetWithMedia(element.body, element.image, element.date, authClient, file)
      } else {
        twitter.postScheduledTweetWithoutMedia(element.body, element.date, authClient, file)
      }
    })
  }
})

// listen for get request for hashtag and twitter data
app.get('/', function (req, res) {

  let fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt')
  let file = []
  if(fileExists){
    let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8')
    file = JSON.parse(data)
  }

  res.render('index',  {
    hashtag: null, 
    twitterData: null, 
    tweetbox: null,
    scheduledTweets: file
  })
})

// listen for get request on root url --> http://localhost:3000
app.set('view engine', 'ejs')

// twitter API 2.0 authorisation

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
  req.session.oauth_token_secret = oauth_token_secret  // get the saved oauth_token_secret from session

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
  
// retrieve and display hashtag search results and scheduled tweets
app.post('/', async function (req, res) {

  let fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt')
  let file = []
  if(fileExists){
    let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8')
    file = JSON.parse(data)
  }

  if (req.body.hashtag !== null) {    
    // simulate twitter API call with mock data
    const simulateTweetSearch = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(mockTweets)
        }, 1000) // simulate 1 sec delay
      })
    }
    
    try {
      const searchResults = await simulateTweetSearch() 
      console.log('Search results:', searchResults)
      res.render('index', {
        hashtag: req.body.hashtag, 
        twitterData: searchResults,
        scheduledTweets: file,
        error: null
    })
    } catch (error) {
      console.error('Error searching tweets:', error)
      res.status(500).send('Error searching tweets')
    }
  }
})

// post tweets
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


// schedule tweets
app.post('/scheduleTweet', function (req, res) {

  let tweet = req.body
  let fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt')
  let file = []
  if(fileExists){
    try {
      let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8')
      file = JSON.parse(data)
    } catch (err) {
      console.log('Error parsing', err)
    }
  }

  for (let element of file){
    if(element.body === tweet.body && element.date === tweet.date){
      console.log("repeated tweet")
      res.send("error")
      return false
    }
  }
  
  try {
    file.push(tweet)
    let content = JSON.stringify(file)
    fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content)

    if(tweet.image) {
      twitter.postScheduledTweetWithMedia(tweet.body, tweet.image, tweet.date, authClient, file)
    } else {
      twitter.postScheduledTweetWithoutMedia(tweet.body, tweet.date, authClient, file)
    }
    res.send("success")
  } catch (err) {
    console.log('Error parsing', err)
    res.send("error")
  }
})

// retweet tweet to profile when clicked 
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
    res.send(req.query.id)
  } catch (error) {
    console.error('Error retweeting', error)
    res.send("error")
  }
})

// undo retweet 
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
    res.send(req.query.id)
  } catch (error) {
    console.error('Error undo retweet', error)
    res.send("error")
  }
})

// favorite tweet on profile when clicked 
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
    res.send(req.query.id)
  } catch (error) {
    console.error('Error favoriting tweet', error)
    res.send("error")
  }
})

// undo favorite tweet 
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
    res.send(req.query.id)
  } catch (error) {
    console.error('Error undo favoriting tweet', error)
    res.send("error")
  }
})


// delete scheduled tweet
app.post('/deleteScheduledTweet', function (req, res) {
  let data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8')
  const file = JSON.parse(data)
  let tweetToDelete = req.body

  let updatedScheduledTweets = []
    for(let i=0; i < file.length; i++) {
        if(file[i].body !== tweetToDelete.body || file[i].date !== tweetToDelete.date) {
            updatedScheduledTweets.push(file[i])
        }   
  }

  let content = JSON.stringify(updatedScheduledTweets)
  fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content)
})
