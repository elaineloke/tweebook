const express = require('express')
const app = express()
const path = require('path')

const twit = require("twit")
const bodyParser = require('body-parser')
const fs = require('fs');
const twitter = require('./twitter');
const { parse } = require('path')
const e = require('express')

app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json({limit: '25mb'}));

//start server & listen on port 3000
app.listen(3000, function () {
  console.log('Node listening on port 3000');
  if(fs.existsSync(__dirname +'/tmp/scheduling.txt')) {
    var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
    const file = JSON.parse(data);

    file.forEach(element => {
      if(element.image){
        twitter.postScheduledTweetWithMedia(element.body, element.image, element.date, Twitter, file);
      } else {
        twitter.postScheduledTweetWithoutMedia(element.body, element.date, Twitter, file);
      }
    });
  }
})

//listen for get request for hashtag and twitter data
app.get('/', function (req, res) {

  var fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  var file = [];
  if(fileExists){
    var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
    file = JSON.parse(data);
  }

  res.render('index',  {
    hashtag: null, 
    twitterData: null, 
    tweetbox: null,
    scheduledTweets: file
  });
})


//listen for get request on root url. eg. http://localhost:3000
app.set('view engine', 'ejs')


//connect to Twitter profile
let Twitter = new twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: '',
  timeout_ms: 60 * 1000, 
  strictSSL: true, 
});
  
//retrieve and display hashtag search results and scheduled tweets
app.post('/', function (req, res) {

  var fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  var file = [];
  if(fileExists){
    var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
    file = JSON.parse(data);
  }

  if (req.body.hashtag !== null) {

  Twitter.get('search/tweets', {q: req.body.hashtag, count: 100, result_type: "mixed" }).
  catch(function (err) {
    console.log('caught error', err.stack)
    res.render('index', {
        hashtag: null,
        twitterData: null,
        error: err.stack
    });
  }).
  then(function (result) {
    res.render('index', {
        hashtag: req.body.hashtag, 
        twitterData: result.data,
        scheduledTweets: file,
        error: null
    });
  });
  }
});

//post tweets
app.post('/postTweet', function (req, res) {

  if(req.body.image){
    Twitter.post('media/upload', { media_data: req.body.image }, function (err, data, response) {
      var mediaIdStr = data.media_id_string
      var altText = req.body.text
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

      Twitter.post('media/metadata/create', meta_params, function (err, data, response) {
        if (!err) {
          var params = { status: req.body.text, media_ids: [mediaIdStr] }
    
          Twitter.post('statuses/update', params, function (err, data, response) {
            if(err){
              res.send("error");
            } else {
              res.send("success");
            }
          })
        }
      })
    })
  } else {
    Twitter.post('statuses/update', {status: req.body.text}, function(err, data, response){
      if(err){
        res.send("error");
      } else {
        res.send("success");
    }
    })
  }
})


//schedule tweets
app.post('/scheduleTweet', function (req, res) {

  var tweet = req.body;
  var fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  var file = [];
  if(fileExists){
    try {
      var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
      file = JSON.parse(data);
    } catch (err) {
      console.log('Error parsing', err);
    }
  }

  for (let element of file){
    if(element.body === tweet.body && element.date === tweet.date){
      console.log("repeated tweet");
      res.send("error");
      return false;
    }
  }
  
  try {
    file.push(tweet);
    var content = JSON.stringify(file);
    fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);

    if(tweet.image) {
      twitter.postScheduledTweetWithMedia(tweet.body, tweet.image, tweet.date, Twitter, file);
    } else {
      twitter.postScheduledTweetWithoutMedia(tweet.body, tweet.date, Twitter, file);
    }
    res.send("success");
  } catch (err) {
    console.log('Error parsing', err);
    res.send("error");
  }
})

//retweet tweet to profile when clicked 
app.get('/retweet', function (req, res) {
  Twitter.post('statuses/retweet/:id', {id: req.query.id}, function(err, data, response){
    if(response){
      console.log("retweeted");
      res.send(data.id_str);
    }
    if(err){
      console.log("error with retweeting");
    }
  })
});

//undo retweet 
app.get('/undoRetweet', function (req, res) {
  Twitter.post('statuses/destroy/:id', {id: req.query.id}, function(err, response){
    if(response){
      console.log("undo retweet");
    }
    if(err){
      console.log("error with undo retweet");
      console.log(err);
    }
  })
});

//favorite tweet on profile when clicked 
app.get('/favtweet', function (req, res) {
  Twitter.post('favorites/create', {id: req.query.id}, function(err, data, response){
    if(response){
      console.log("favorited");
      res.send(data.id_str);
    }
    if(err){
      console.log("error with favoriting");
    }
  })
});

//undo favorite tweet 
app.get('/undoFavTweet', function (req, res) {
  Twitter.post('favorites/destroy', {id: req.query.id}, function(err, response){
    console.log(req.query.id)
    if(response){
      console.log("undo favorite tweet");
    }
    if(err){
      console.log("error with undo favoriting");
      console.log(err);
    }
  })
});


//delete scheduled tweet
app.post('/deleteScheduledTweet', function (req, res) {
  var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
  file = JSON.parse(data);
  var tweetToDelete = req.body;

  var updatedScheduledTweets = [];
    for(let i=0; i < file.length; i++) {
        if(file[i].body !== tweetToDelete.body && file[i].date !== tweetToDelete.date) {
            updatedScheduledTweets.push(file[i]);
        }   
  }

  var content = JSON.stringify(updatedScheduledTweets);
  fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
});

